export default {
	InputValue : "",   //输入
	answer:{text:''},   //回答
	filesList:[],  //附件列表
	uploadFilesList:[], //附件保存列表
	ImgActive:null, //附件列表高亮索引

	//prompt拼接
	promptSplicing(InquiryMainResults,InspectionAdvice,knowledgeAnswer) {
		const replacements = {
			'%InquiryMainResults%': InquiryMainResults,
			'%InspectionAdvice%': InspectionAdvice,
			'%InputValue%': this.InputValue,
			'%knowledgeAnswer%': knowledgeAnswer,
			// 可以继续添加其他需要替换的占位符
		};
		// 使用正则表达式一次性匹配所有占位符
		const pattern = new RegExp(Object.keys(replacements).join('|'), 'g');
		return Prompt.modelPrompt.replace(pattern, match => replacements[match]);
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

	// 附件图片预览
	ImgPreview(index){
		this.ImgActive = index
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
		//检验/检查处方
		const InspectionAdvice = global.store.InspectionAdvice
		if(!InspectionAdvice) return showAlert('请先执行检验/检查建议步骤！')
		console.log('InspectionAdvice',InspectionAdvice)
		//主述结果
		const InquiryMainResults = global.store.InquiryMainResults
		if(!InquiryMainResults) return showAlert('请先执行问诊步骤！')
		console.log('InquiryMainResults',InquiryMainResults)

		//清空上次的回答
		this.answer.text = ''

		let knowledgeAnswer = ''
		// 知识库检索
		if(knowledge_Swtich.isSwitchedOn && this.InputValue){
			try{
				const knowledgeResult = await	knowledgeAPI.run()
				console.log('knowledgeResult',  knowledgeResult)
				knowledgeAnswer = knowledgeResult.data.answer
			}catch(error){
				showAlert('知识库检索失败！', 'error')
			}
		}
		// prompt拼接
		const text = this.promptSplicing(InquiryMainResults, InspectionAdvice, knowledgeAnswer)
		console.log('prompt内容：', text)

		Commom.apiSearchContent = [
			{type:'text',text},
			...this.filesList
		]
		console.log(Commom.apiSearchContent)
		try{
			const res = await completions.run()
			this.answer.text = res.choices[0].message.content
			console.log('this.answer.text', this.answer.text)
		}catch(error){
			console.log('err',error)
			showAlert('模型调用失败！', 'error')
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

			const res = await InsertDiagnosis.run(params)
			showAlert('数据保存成功！', 'success')

			// 等待3秒返回详情页
			await new Promise((resolve) => setTimeout(resolve, 2000))
			navigateTo('诊疗详情', {
				"consultation_id": global.URL.queryParams.consultation_id
			}, 'SAME_WINDOW')
		}catch(error){
			showAlert('数据写入失败！', 'error')
		}
	}
}