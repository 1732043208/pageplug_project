export default {
	InputValue : "",   //输入
	answer: {text: ''},   //主述结果
	filesList:[], //附件列表
	uploadFilesList:[], //附件保存列表
	ImgActive:null, //附件列表高亮索引
	//主述结果prompt
	mainPrompt:`
	患者主述：%InputValue%，根据患者主述，把主述分类，并给出类别标题。
	要求如下：使用中文回复。
	`, 
	// prompt拼接替换
	promptSplicing(){
		const replacements = {
			'%InputValue%': this.InputValue
		}
		return Object.entries(replacements).reduce(
			(text, [pattern, replacement]) => text.replace(new RegExp(pattern), replacement),
			this.mainPrompt
		)
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
		if(!this.InputValue && !this.filesList.length) return showAlert("请输入您的症状！")
		//清空上次的回答
		this.answer.text = ''
		const text = this.promptSplicing()
		console.log('prompt内容：', text)
		Commom.apiSearchContent = [
			{type:'text',text},
			...this.filesList
		]
		try{
			console.log(Commom.apiSearchContent)
			const res = await completions.run()
			console.log(res)
			this.answer.text = res.choices[0].message.content
			await this.InsertFunction()

		}catch(error) {
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
			const res = await InsertInquiry.run(params)
			showAlert('数据保存成功！', 'success')
		}catch(error){
			showAlert('数据写入失败！', 'error')
		}
	}
}