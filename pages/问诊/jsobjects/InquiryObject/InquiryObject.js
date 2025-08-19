export default {
	InputValue : "",   //输入
	answer: {text: ''},   //主述结果
	filesList:[], //附件列表
	uploadFilesList:[], //附件保存列表
	ImgActive:null, //附件列表高亮索引

	//prompt拼接
	promptSplicing(knowledgeAnswer) {
		const replacements = {
			'%InputValue%': this.InputValue,
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

	// 删除附件列表元素
	deleteFile(index){
		console.log(index)
		this.filesList.splice(index, 1);
		this.uploadFilesList.splice(index,1)
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

	// 修改输入框内容
	changeInputValue(value){
		console.log('value',value)
		this.InputValue = value
	},

	// 执行按钮
	async getCompletions(){
		if(!this.InputValue) return showAlert("请输入您的症状！")
		//清空上次的回答
		this.answer.text = ''
		showModal('Loading')
		let knowledgeAnswer = ''
		// 知识库检索
		if(knowledge_Swtich.isSwitchedOn){
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
		// 生成模型调用
		try{
			const res = await completions.run()
			console.log(res)
			this.answer.text = res.choices[0].message.content

			// 往对话上下文中添加模型回复记录
			Commom.modelSearchList.push({"role":"assistant", "content": this.answer.text})
		}catch(error) {
			console.log('err',error)
			showAlert('模型调用失败！', 'error')
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
			const res = await InsertInquiry.run(params)
			showAlert('数据保存成功！', 'success')

			// 等待3秒返回详情页
			await new Promise((resolve) => setTimeout(resolve, 2000))
			navigateTo('诊疗详情', {
				"consultation_id": global.URL.queryParams.consultation_id
			}, 'SAME_WINDOW')
		}catch(error){
			showAlert('数据写入失败！', 'error')
		}
	},
	// 模型对话传参处理
	modelParamsHandle(knowledgeAnswer){
		// prompt拼接
		const text = this.promptSplicing(knowledgeAnswer)
		console.log('prompt内容：', text)

		// 往模型对话列表添加询问记录
		Commom.modelSearchList.push({"role":"user","content": [
			{type:'text',text},
			...this.filesList
		]})

		// 模型对话传参-判断是否有启用上下文
		Commom.modelSearchContent = context_Swtich.isSwitchedOn 	?  Commom.modelSearchList  : 
		[{"role":"user","content": [
			{type:'text',text},
			...this.filesList
		]}]
	}
}