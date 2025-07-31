export default {
	InputValue : "",   //输入
	mainResults:"",   //主述结果
	adviceResults:"", //建议结果
	filesList:[], //附件列表
	mainPrompt:`
	患者主述：%InputValue%，根据患者主述，把主述分类，并给出类别标题。
	要求如下：使用中文回复。
	`, //主述结果prompt
	advicePrompt:`
	患者主述：%mainResults%，根据主述结果，开出检验/检查处方。
	要求如下：使用中文回复。
	`,//建议prompt
	// prompt拼接替换
	promptSplicing(prompt){
		const replacements = {
			'%InputValue%': this.InputValue,
			'%mainResults%': this.mainResults,
		}
		return Object.entries(replacements).reduce(
			(text, [pattern, replacement]) => text.replace(new RegExp(pattern), replacement),
			prompt
		)
	},
	fileLoad(files){
		this.filesList = []
		console.log('files',files)
		files.forEach(item=>{
			if(item.type.includes("image")) this.filesList.push({type:'image_url',image_url:{url:item.data}})
		})
		console.log('filesList', this.filesList)
	},

	changeInputValue(value){
		console.log('value',value)
		this.InputValue = value
	},

	async getCompletions(){
		const files = FilePicker1Copy.files
		if(!this.InputValue && !files.length) return showAlert("请输入您的症状！")
		this.fileLoad(files)
		Commom.apiSearchContent = [
			{type:'text',text:this.promptSplicing(this.mainPrompt)},
			...this.filesList
		]
		const res = await completions.run()
		console.log(res)
		this.mainResults = res.choices[0].message.content
		storeValue("InquiryMainResults", this.mainResults)
		//重置上传组件
		resetWidget("FilePicker1Copy", true);
	},
}