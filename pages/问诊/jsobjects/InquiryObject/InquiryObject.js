export default {
	InputValue : "",   //输入
	answerValue:"",   //主述结果
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
		const files = FilePicker2Copy.files
		if(!this.InputValue && !files.length) return showAlert("请输入您的症状！")
		this.fileLoad(files)
		//清空上次的回答
		this.answerValue = ''
		const text = this.promptSplicing()
		console.log('prompt内容：', text)
		Commom.apiSearchContent = [
			{type:'text',text},
			...this.filesList
		]
		console.log(Commom.apiSearchContent)
		const res = await completions.run()
		console.log(res)
		this.answerValue = res.choices[0].message.content
		storeValue("InquiryMainResults", this.answerValue)
	},
}