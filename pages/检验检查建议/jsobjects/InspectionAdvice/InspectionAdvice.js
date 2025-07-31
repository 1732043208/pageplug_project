export default {
	InputValue : "",   //输入
	adviceResults:"",   //回答
	filesList:[], //附件列表
	prompt:`
	患者主述：%InquiryMainResults%。
	附言：%InputValue%。
	根据主述结果，开出检验/检查处方。
	`,
	promptSplicing(InquiryMainResults){
		const replacements = {
			'%InquiryMainResults%': InquiryMainResults,
			'%InputValue%': this.InputValue,
		}
		return Object.entries(replacements).reduce(
			(text, [pattern, replacement]) => text.replace(new RegExp(pattern), replacement),
			this.prompt
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

	async getAdvice(){
		const InquiryMainResults = global.store.InquiryMainResults
		if(!InquiryMainResults) return showAlert('请先执行问诊步骤！')
		console.log(global.store.InquiryMainResults)

		const text = this.promptSplicing(InquiryMainResults)
		console.log('text',text)
		const files = FilePicker1Copy.files
		this.fileLoad(files)
		Commom.apiSearchContent = [
			{type:'text',text},
			...this.filesList
		]
		console.log(Commom.apiSearchContent)
		const res = await completions.run()
		console.log('res',res)
		this.adviceResults = res.choices[0].message.content
		console.log('this.adviceResults',this.adviceResults)
	}
}