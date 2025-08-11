export default {
	InputValue : "",   //输入
	answer: {text: ''},   //主述结果
	filesList:[], //附件列表
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
	// 删除附件列表元素
	deleteFile(index){
		console.log(index)
		this.filesList.splice(index, 1);
	},
	// 上传附件
	fileLoad(files){
		this.filesList = []
		console.log('files',files)
		files.forEach(item=>{
			if(item.type.includes("image")) this.filesList.push({type:'image_url',image_url:{url:item.data}})
		})
		console.log('filesList', this.filesList)
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
			storeValue("InquiryMainResults", this.answer.text)
			await this.InsertFunction()

		}catch(error) {
			console.log('err',error)
			showAlert('模型调用失败！', 'error')
		}
	},
	//保存数据库
	async	InsertFunction(){
		const params = {
			nowTime: Math.floor(Date.now() / 1000)
		}
		try{
			const res = await InsertInquiry.run(params)
			showAlert('数据保存成功！', 'success')
		}catch(error){
			showAlert('数据写入失败！', 'error')
		}
	}
}