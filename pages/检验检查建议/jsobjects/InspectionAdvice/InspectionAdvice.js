export default {
	InputValue : "",   //输入
	answerValue:"",   //回答
	filesList:[], //附件列表
	prompt:`
	患者主述：%InquiryMainResults%。
	附言：%InputValue%。
	根据主述结果，开出检验/检查处方。
	`,
	// prompt拼接
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
	// 获取诊断建议
	async getAdvice(){
		// InquiryMainResults 问诊AI生成的内容
		const InquiryMainResults = global.store.InquiryMainResults
		if(!InquiryMainResults) return showAlert('请先执行问诊步骤！')
		//清空上次的回答
		this.answerValue = ''
		const text = this.promptSplicing(InquiryMainResults)
		console.log('prompt内容：', text)
		Commom.apiSearchContent = [
			{type:'text',text},
			...this.filesList
		]
		console.log(Commom.apiSearchContent)
		const res = await completions.run()
		console.log('res',res)
		this.answerValue = res.choices[0].message.content
		storeValue('InspectionAdvice',this.answerValue)
		console.log('this.answerValue',this.answerValue)
	}
}