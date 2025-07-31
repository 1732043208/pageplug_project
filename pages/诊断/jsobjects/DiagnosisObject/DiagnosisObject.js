export default {
	InputValue : "",   //输入
	adviceResults:"",   //回答
	filesList:[],  //附件列表
	prompt:`
	患者主述：%InquiryMainResults%。
	检验检查处方：%InspectionAdvice%
	附言：%InputValue%。
	根据患者主述、检验检查处方、以及附言，给出诊断结果。
	`,
	promptSplicing(InquiryMainResults,InspectionAdvice){
		const replacements = {
			'%InquiryMainResults%': InquiryMainResults,
			'%InspectionAdvice%': InspectionAdvice,
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
		//检验/检查处方
		const InspectionAdvice = global.store.InspectionAdvice
		if(!InspectionAdvice) return showAlert('请先执行检验/检查建议步骤！')
		console.log('InspectionAdvice',InspectionAdvice)
		//主述结果
		const InquiryMainResults = global.store.InquiryMainResults
		if(!InquiryMainResults) return showAlert('请先执行问诊步骤！')
		console.log('InquiryMainResults',InquiryMainResults)

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