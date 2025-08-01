export default {
	InputValue : "",   //输入
	answerValue:"",   //回答
	filesList:[], //附件列表
	prompt:'患者叙述：%InputValue%，根据患者叙述，推荐一个最合适的科室',

	//prompt拼接
	promptSplicing(){
		const replacements = {
			'%InputValue%': this.InputValue,
		}
		return Object.entries(replacements).reduce(
			(text, [pattern, replacement]) => text.replace(new RegExp(pattern), replacement),
			this.prompt
		)
	},
	// 文件上传
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
			{type:'text',text:this.promptSplicing()},
			...this.filesList
		]
		console.log('ssss',Commom.apiSearchContent )
		const res = await completions.run()
		console.log(res)
		this.answerValue = res.choices[0].message.content
	},
}