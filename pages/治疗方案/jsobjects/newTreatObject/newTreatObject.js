export default {
	InputValue : "",   //输入
	answerValue:"",   //回答
	filesList:[],  //附件列表
	treatContent:'', //治疗措施
	medicationContent:'',//用药
	prompt:`
	主述结果：%InquiryMainResults%。
	检验检查处方：%InspectionAdvice%
	诊断结果：%DiagnosisAdvice%
	附言：%InputValue%。
	根据主述结果、检验检查处方、诊断结果以及附言，给出%RequireType%。`,
	//prompt拼接
	promptSplicing(InquiryMainResults,InspectionAdvice,DiagnosisAdvice,RequireType){
		const replacements = {
			'%InquiryMainResults%': InquiryMainResults,
			'%InspectionAdvice%': InspectionAdvice,
			'%DiagnosisAdvice%': DiagnosisAdvice,
			'%RequireType%': RequireType,
			'%InputValue%': this.InputValue,
		}
		return Object.entries(replacements).reduce(
			(text, [pattern, replacement]) => text.replace(new RegExp(pattern), replacement),
			this.prompt
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
	// 删除附件列表元素
	deleteFile(index){
		console.log(index)
		this.filesList.splice(index, 1);
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
		// 清空上次回答
		this.answerValue = ''
		const params1 = {
			list:  [
				{
					type:'text',
					text: this.promptSplicing(InquiryMainResults, InspectionAdvice, DiagnosisAdvice, '治疗措施')
				},
				...this.filesList
			]
		}
		// 治疗措施
		completions.run(params1).then(res=>{
			console.log('res',res)
			this.treatContent =  res.choices[0].message.content
		})

		const params2 = {
			list:  [
				{
					type:'text',
					text: this.promptSplicing(InquiryMainResults, InspectionAdvice, DiagnosisAdvice, '用药处方')
				},
				...this.filesList
			]
		}
		// 用药
		completions.run(params2).then(res=>{
			console.log('res',res)
			this.medicationContent =  res.choices[0].message.content
		})
	}
}