export default {
	InputValue : "",   //输入
	treatContent: {text: ''},   // 治疗措施回答
	medicationContent: {text:''}, //用药回答
	filesList:[],  //附件列表
	uploadFilesList:[], //附件保存列表
	ImgActive:null, //附件列表高亮索引

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

		showModal('Loading')
		// 清空上次回答
		this.treatContent.text = ''
		this.medicationContent.text = ''

		let knowledgeAnswer = ''
		// 知识库检索
		if(knowledge_Swtich.isSwitchedOn && this.InputValue){
			try{
				const knowledgeResult = await	knowledgeAPI.run()
				console.log('knowledgeResult',  knowledgeResult)
				knowledgeAnswer = knowledgeResult.data.answer
			}catch(error){
				closeModal('Loading');
				showAlert('知识库检索失败！', 'error')
			}
		}

		// 模型对话传参处理
		this.modelParamsHandle(knowledgeAnswer)
		try{
			const res= 	await Promise.all([completions.run({ data: Commom.modelSearchContent1 }), completions.run({ data: Commom.modelSearchContent2 })])
			console.log('res1',res)
			this.treatContent.text =  res[0].choices[0].message.content
			this.medicationContent.text =  res[1].choices[0].message.content

			// 往对话上下文中添加模型回复记录
			Commom.modelSearchList1.push({"role":"assistant", "content": this.treatContent.text })
			Commom.modelSearchList2.push({"role":"assistant", "content": this.medicationContent.text })
		}catch(error){
			showAlert('模型调用失败！')
			// 模型调用失败，清除最后一条用户记录
			Commom.modelSearchList1.pop()
			Commom.modelSearchList2.pop()
		}
		closeModal('Loading');
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
	}
}