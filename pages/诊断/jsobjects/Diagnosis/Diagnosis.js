export default {
	InputValue : "",   //输入
	answer:{text:''},   //回答
	filesList:[],  //附件列表
	uploadFilesList:[], //附件保存列表
	ImgActive:null, //附件列表高亮索引
	prompt:`
	主述结果：%InquiryMainResults%。
	检验检查处方：%InspectionAdvice%
	附言：%InputValue%。
	根据主述结果、检验检查处方、以及附言，给出诊断结果。
	`,
	//prompt拼接
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
	// 修改输入框内容
	changeInputValue(value){
		console.log('value',value)
		this.InputValue = value
	},
	// 获取诊断结果
	async getAdvice(){
		//检验/检查处方
		const InspectionAdvice = global.store.InspectionAdvice
		if(!InspectionAdvice) return showAlert('请先执行检验/检查建议步骤！')
		console.log('InspectionAdvice',InspectionAdvice)
		//主述结果
		const InquiryMainResults = global.store.InquiryMainResults
		if(!InquiryMainResults) return showAlert('请先执行问诊步骤！')
		console.log('InquiryMainResults',InquiryMainResults)

		const text = this.promptSplicing(InquiryMainResults,InspectionAdvice)
		console.log('prompt内容：', text)
		//清空上次的回答
		this.answer.text = ''
		Commom.apiSearchContent = [
			{type:'text',text},
			...this.filesList
		]
		console.log(Commom.apiSearchContent)
		try{
			const res = await completions.run()
			this.answer.text = res.choices[0].message.content
			console.log('this.answer.text', this.answer.text)
			await this.InsertFunction()
		}catch(error){
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

			const res = await InsertDiagnosis.run(params)
			showAlert('数据保存成功！', 'success')
		}catch(error){
			showAlert('数据写入失败！', 'error')
		}
	}
}