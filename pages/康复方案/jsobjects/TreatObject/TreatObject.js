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
	根据主述结果、检验检查处方、诊断结果以及附言，给出治疗措及用药处方。
	要求：
	1、不要返回markdown格式；
	2、"治疗措施"生成内容以&开头、&结尾包裹；
	3、"用药处方"生成内容以%开头、%结尾包裹；
	`,
	//prompt拼接
	promptSplicing(InquiryMainResults,InspectionAdvice,DiagnosisAdvice){
		const replacements = {
			'%InquiryMainResults%': InquiryMainResults,
			'%InspectionAdvice%': InspectionAdvice,
			'%DiagnosisAdvice%': DiagnosisAdvice,
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

		const text = this.promptSplicing(InquiryMainResults,InspectionAdvice,DiagnosisAdvice)
		console.log('prompt内容：', text)
		//清空上次的回答
		this.answerValue = ''
		Commom.apiSearchContent = [
			{type:'text',text},
			...this.filesList
		]
		console.log(Commom.apiSearchContent)
		try{
			const res = await completions.run()
			this.answerValue = res.choices[0].message.content
			console.log('sss',this.answerValue)

			this.treatContent = this.answerValue.match( /&([\s\S]+?)&/g)[0];   //治疗措施
			console.log('this.treatContent',this.treatContent)
			this.medicationContent =  this.answerValue.match( /%([\s\S]+?)%/g)[0];   //用药
			console.log('this.medicationContent ',this.medicationContent )

		}catch(error){
			console.log('err',error)
			showAlert('模型调用失败！', 'error')
		}
	}
}