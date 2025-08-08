export default {
	InputValue : "",   //输入
	answer: {text:`患者主诉是"头疼"。头疼是一个非常常见的症状，可以由多种原因引起，涉及多个科室。

以下是一些可能导致头疼的科室以及原因：

1.  **神经内科：**
    *   偏头痛
    *   紧张性头痛
    *   丛集性头痛
    *   颅内压升高（如脑肿瘤、脑积水）
    *   脑血管疾病（如脑出血、脑梗死、脑动脉瘤）
    *   脑膜炎、脑炎等感染性疾病
    *   神经系统退行性疾病

2.  **眼科：**
    *   青光眼
    *   屈光不正（近视、远视、散光）
    *   眼疲劳
    *   眼部炎症

3.  **耳鼻喉科：**
    *   鼻窦炎
    *   中耳炎
    *   颞下颌关节紊乱

4.  **口腔科/颌面外科：**
    *   牙齿问题（如龋齿、牙周炎、颞下颌关节紊乱）

5.  **精神心理科：**
    *   焦虑症
    *   抑郁症
    *   压力过大

6.  **全科/内科：**
    *   感冒、发烧等上呼吸道感染
    *   高血压
    *   贫血
    *   脱水

7.  **外科/普外科：**
    *   颈椎病
    *   颅骨骨折（外伤后）

**最合适的科室取决于头疼的性质、持续时间、伴随症状以及患者的病史。**

*   **如果头疼突然、剧烈，或者伴有神经系统症状（如视力模糊、肢体麻木、言语不清等），应首先考虑神经内科，排除颅内严重病变。**
*   **如果头疼与眼疲劳、视力问题有关，应考虑眼科。**
*   **如果头疼与鼻塞、流涕、面部疼痛有关，应考虑耳鼻喉科。**
*   **如果头疼与牙齿问题有关，应考虑口腔科。**
*   **如果头疼与情绪、压力有关，应考虑精神心理科。**
*   **如果头疼是逐渐发生的，或者伴有全身症状（如发烧、乏力等），应考虑全科/内科。**

**总结：**

*   **最有可能的科室：神经内科** (因为头痛是最常见的神经系统症状之一)
*   **需要更多信息：** 头痛的性质 (搏动性、胀痛、刺痛等), 持续时间, 频率, 诱发因素, 缓解因素, 伴随症状 (恶心、呕吐、畏光、视力变化、肢体麻木等), 病史 (高血压, 糖尿病, 肿瘤史, 外伤史等)。`},   //回答
	filesList:[], //附件列表
	prompt:`
	患者叙述：%InputValue%，根据患者叙述，推荐一个最合适的科室
	`,
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
	// 删除附件列表元素
	deleteFile(index){
		console.log(index)
		this.filesList.splice(index, 1);
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
	// 修改输入框内容
	changeInputValue(value){
		console.log('value',value)
		this.InputValue = value
	},
	// 执行按钮
	async getCompletions(){
		if(!this.InputValue && !this.filesList.length) return showAlert("请输入您的症状！")
		//清空上次的回答
		this.answer.text = ''
		const text = this.promptSplicing()
		console.log('prompt内容：', text)
		Commom.apiSearchContent = [
			{type:'text',text:this.promptSplicing()},
			...this.filesList
		]
		console.log('ssss',Commom.apiSearchContent )
		try{
			const res = await completions.run()
			console.log(res)
			this.answer.text = res.choices[0].message.content
		}catch(error){
			console.log('err',error)
			showAlert('模型调用失败！', 'error')
		}
	},
}