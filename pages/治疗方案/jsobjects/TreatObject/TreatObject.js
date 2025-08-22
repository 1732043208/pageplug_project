export default {
	InputValue : "",   //输入
	treatContent: {text: ''},   // 治疗措施回答
	medicationContent: {text:''}, //用药回答
	filesList:[],  //附件列表
	uploadFilesList:[], //附件保存列表
	ImgActive:null, //附件列表高亮索引
	isSaveBtnShow: false, //保存按钮是否显示

	//prompt拼接
	promptSplicing(knowledgeAnswer, RequireType) {
		const replacements = {
			'%InputValue%': this.InputValue,
			'%InquiryMainResults%':  global.store.InquiryMainResults,
			'%InspectionAdvice%':  global.store.InspectionAdvice,
			'%DiagnosisAdvice%':  global.store.DiagnosisAdvice,
			'%RequireType%': RequireType,
			'%patientStatement%': global.store.patientStatement, //患者主述
			'%knowledgeAnswer%': knowledgeAnswer,
			// 可以继续添加其他需要替换的占位符
		};
		// 使用正则表达式一次性匹配所有占位符
		const pattern = new RegExp(Object.keys(replacements).join('|'), 'g');
		return Prompt.modelPrompt.replace(pattern, match => replacements[match]);
	},

	// 附件图片预览
	ImgPreview(index){
		this.ImgActive = index
	},

	// 文件上传
	async	fileLoad(files){
		this.filesList = []
		console.log('files',files)
		files.forEach(item=>{
			const names = item.name.split('.') 
			item.name = names[0] + '_' + Date.now() + '.' +names[1]
			if(item.type.includes("image")) this.filesList.push({type:'image_url',image_url:{url: item.data }})
		})
		this.uploadFilesList = files
	},

	// 删除附件列表元素
	deleteFile(index){
		console.log(index)
		this.filesList.splice(index, 1);
		this.uploadFilesList.splice(index,1)
	},

	// 修改输入框内容
	changeInputValue(value){
		console.log('value',value)
		this.InputValue = value
	},

	// 获取诊断结果
	async getAdvice(){
		//诊断
		const DiagnosisAdvice = global.store.DiagnosisAdvice
		if(!DiagnosisAdvice) return showAlert('请先执行诊断步骤！')
		//检验/检查处方
		const InspectionAdvice = global.store.InspectionAdvice
		if(!InspectionAdvice) return showAlert('请先执行检验/检查建议步骤！')
		console.log('InspectionAdvice',InspectionAdvice)
		//主述结果
		const InquiryMainResults = global.store.InquiryMainResults
		if(!InquiryMainResults) return showAlert('请先执行问诊步骤！')
		console.log('InquiryMainResults',InquiryMainResults)

		// 清空上次回答
		this.treatContent.text = ''
		this.medicationContent.text = ''

		let knowledgeAnswer = ''
		// 知识库检索
		if(knowledge_Swtich.isSwitchedOn && this.InputValue){
			showModal('Loading')
			try{
				const knowledgeResult = await	knowledgeAPI.run()
				console.log('knowledgeResult',  knowledgeResult)
				knowledgeAnswer = knowledgeResult.data.answer
			}catch(error){
				showAlert('知识库检索失败！', 'error')
			}
			closeModal('Loading');
		}

		// 模型对话传参处理
		this.modelParamsHandle(knowledgeAnswer)
		try{
			await Promise.all([
				this.modelCompletion(Commom.modelSearchContent1, '1'), 
				this.modelCompletion(Commom.modelSearchContent2, '2')
			])
			this.isSaveBtnShow = true

			// 往对话上下文中添加模型回复记录
			Commom.modelSearchList1.push({"role":"assistant", "content": this.treatContent.text })
			Commom.modelSearchList2.push({"role":"assistant", "content": this.medicationContent.text })
		}catch(error){
			showAlert('模型调用失败！')
			// 模型调用失败，清除最后一条用户记录
			Commom.modelSearchList1.pop()
			Commom.modelSearchList2.pop()
		}
	},

	//保存数据库
	async	InsertFunction(){
		try{
			// 附件上传到MinIO
			const uploadResult = 	await  MinIOUpload.run({urls: this.uploadFilesList})
			console.log('uploadResult',uploadResult)

			const params = {
				nowTime: Math.floor(Date.now() / 1000),
				attachment_urls: uploadResult.urls.map(item=>{
					return {
						url: item,
						fileType: item.split('.').pop()
					}
				})
			}

			const res = await InsertTreat.run(params)
			showAlert('数据保存成功！', 'success')

			// 等待3秒返回详情页
			await new Promise((resolve) => setTimeout(resolve, 2000))
			navigateTo('诊疗详情', {"consultation_id": global.URL.queryParams.consultation_id}, 'SAME_WINDOW')
		}catch(error){
			showAlert('数据写入失败！', 'error')
		}
	},
	// 模型对话传参处理
	modelParamsHandle(knowledgeAnswer){
		// prompt拼接
		const measurePrompt = this.promptSplicing(knowledgeAnswer, '治疗措施')
		console.log('prompt内容：', measurePrompt)
		const medicationPrompt = this.promptSplicing(knowledgeAnswer, '用药处方')
		console.log('prompt内容：', medicationPrompt)

		// 往模型对话列表添加询问记录（治疗措施）
		Commom.modelSearchList1.push({"role":"user","content": [
			{type:'text',text: measurePrompt},
			...this.filesList
		]})

		// 模型对话传参-判断是否有启用上下文（治疗措施）
		Commom.modelSearchContent1 = context_Swtich.isSwitchedOn 	?  Commom.modelSearchList1  : 
		[{"role":"user","content": [
			{type:'text',text: measurePrompt},
			...this.filesList
		]}]

		// 往模型对话列表添加询问记录（用药方法）
		Commom.modelSearchList2.push({"role":"user","content": [
			{type:'text',text: medicationPrompt},
			...this.filesList
		]})

		// 模型对话传参-判断是否有启用上下文（用药方法）
		Commom.modelSearchContent2 = context_Swtich.isSwitchedOn 	?  Commom.modelSearchList2  : 
		[{"role":"user","content": [
			{type:'text',text: medicationPrompt},
			...this.filesList
		]}]
	},

	modelCompletion(modelSearchContent, type) {
		return new Promise((resolve, reject)=>{
			//模型调用参数
			const params = {
				"model":Commom.model,
				"temperature":0.6,
				"top_p":1,
				"frequency_penalty":0,
				"presence_penalty":0,
				"stream": true,
				"messages": modelSearchContent
			} 

			const ctrl = new AbortController();
			fetch_event_source.fetchEventSource('/v1/chat/completions',  {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization':  Commom.model_key
				},
				retry: false, // 完全禁用重试
				openWhenHidden: true,
				signal: ctrl.signal,
				body: JSON.stringify(params),
				onmessage:(e)=> {
					if (e.data === '[DONE]') {
						// 处理DONE消息，比如关闭连接、做一些收尾工作等
						console.log('SSE 连接已完成');
						resolve()
						return;
					}

					const res = JSON.parse(e.data)
					console.log('res',res)
					if(res && res.choices.length) {
						if(type === '1') this.treatContent.text += res.choices[0].delta.content
						else this.medicationContent.text += res.choices[0].delta.content
					}
				},
				onerror:(err) =>{
					console.error('请求出错:', err);
					showAlert('对话请求发生网络错误或涉及违规话题！')
					ctrl.abort()
					reject()
					throw err 
				},
				onopen(res) {
					if (res.status !== 200) {
						console.error('连接失败，HTTP状态码:', res.status);
						return false; // 可以阻止连接
					}
					console.log('连接已打开，状态码:', res.status);
				},
				onclose() {
					console.log('连接已关闭');
				}
			});
		})
	}
}