export default {
	InputValue : "",   //输入
	answer:{text:''},   //回答
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
		this.answer.text = ''
		const text = this.promptSplicing(InquiryMainResults)
		console.log('prompt内容：', text)
		Commom.apiSearchContent = [
			{type:'text',text},
			...this.filesList
		]
		console.log(Commom.apiSearchContent)
		try{
			const res = await completions.run()
			console.log('res',res)
			this.answer.text = res.choices[0].message.content
			storeValue('InspectionAdvice',this.answer.text)
			await this.InsertFunction()
		}catch(error){
			console.log('err',error)
			showAlert('模型调用失败！', 'error')
		}
	},
	//保存数据库
	async	InsertFunction(){
		const params = {
			nowTime	: Math.floor(Date.now() / 1000)
		}
		try{
			const res = await InsertInspectionAdvice.run(params)
			showAlert('数据保存成功！', 'success')
		}catch(error){
			showAlert('数据写入失败！', 'error')
		}
	}
}