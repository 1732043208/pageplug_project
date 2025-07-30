export default {
	InputValue : "",   //输入
	mainResults:"",   //主述结果
	adviceResults:"", //建议结果
	filesList:[], //附件列表
	mainPrompt:`
	患者主述：%mainPrompt%，根据患者主述，把主述分类，并给出类别标题。
	要求如下：使用中文回复。
	`, //主述结果prompt
	advicePrompt:`
	患者主述：%advicePrompt%，根据主述结果，开出检验/检查处方。
	要求如下：使用中文回复。
	`,//建议prompt
	// prompt拼接替换
	promptSplicing(prompt){
		const replacements = {
			'%mainPrompt%': this.mainPrompt,
			'%advicePrompt%': this.mainResults,
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
		if(!this.InputValue) return showAlert("请输入您的症状！")
		this.mainResults = ''
		Commom.apiSearchContent = [
			{type:'text',text:this.promptSplicing(this.mainPrompt)},
			...this.filesList
		]
		const res = await completions.run()
		console.log(res)
		this.mainResults = res.choices[0].message.content

		//重置上传组件
		resetWidget("Input1Copy", true);
		//重置上传组件
		resetWidget("FilePicker1Copy", true);
		/**
		const res = await completions.run()
		console.log(res)
		// 正则表达式：匹配 "choices":[{"index":...,"delta":{"content":"(.*?)"
		const regex = /"choices":\[\{"index":\d+,"delta":\{"content":"([^"]*)"/g;

		// 使用 matchAll 获取所有匹配项
		const matches = [...res.matchAll(regex)];

		// 提取所有的 content 值
		const contents = matches.map(match => match[1]);

		// 打印所有 content 值
		contents.forEach((content, index) => {
			console.log(`${index + 1}. '${content}'`);
			this.answerValue +=content
		});
		**/
	},
	async getAdvice(){
		Commom.apiSearchContent = [
			{type:'text',text:this.promptSplicing(this.advicePrompt)},
		]
		const res = await completions.run()
		console.log('res',res)
		this.adviceResults = res.choices[0].message.content
		console.log('this.adviceResults',this.adviceResults)
		showModal('Modal2');
	}
}