export default {
	InputValue : "",   //输入
	answer: {text:'456'},   //回答
	filesList:[], //附件列表
	uploadFilesList:[], //附件保存列表
	ImgActive: null, //附件列表高亮索引

	//prompt拼接
	promptSplicing(knowledgeAnswer) {
		const replacements = {
			'%InputValue%': this.InputValue,
			'%knowledgeAnswer%': knowledgeAnswer,
			// 可以继续添加其他需要替换的占位符
		};
		// 使用正则表达式一次性匹配所有占位符
		const pattern = new RegExp(Object.keys(replacements).join('|'), 'g');
		return Prompt.modelPrompt.replace(pattern, match => replacements[match]);
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

	// 修改输入框内容
	changeInputValue(value){
		console.log('value',value)
		this.InputValue = value
	},

	// 执行按钮
	async getCompletions(){
		if(!this.InputValue) return showAlert("请输入您的症状！")
		// showModal('Loading')
		//清空上次的回答
		this.answer.text = ''

		let knowledgeAnswer = ''
		// 知识库检索
		if(knowledge_Swtich.isSwitchedOn){
			try{
				const knowledgeResult = await	knowledgeAPI.run()
				console.log('knowledgeResult',  knowledgeResult)
				knowledgeAnswer = knowledgeResult.data.answer
			}catch(error){
				closeModal('Loading');
				showAlert('知识库检索失败！', 'error')
			}
		}

		// prompt拼接
		const text = this.promptSplicing(knowledgeAnswer)
		console.log('prompt内容：', text)

		// 生成模型调用
		Commom.apiSearchContent = [
			{type:'text', text},
			...this.filesList
		]
		console.log('Commom.apiSearchContent', Commom.apiSearchContent )

		this.knowledgeCompletion()
		return
		try{
			const res = await completions.run()
			console.log(res)
			this.answer.text = res.choices[0].message.content
		}catch(error){
			console.log('err', error)
			showAlert('模型调用失败！', 'error')
		}
		closeModal('Loading');
	},

	//保存数据库
	async InsertFunction(){
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
			await InsertTriage.run(params)
			showAlert('数据保存成功！', 'success')

			// 等待3秒返回详情页
			await new Promise((resolve) => setTimeout(resolve, 2000))
			navigateTo('诊疗详情', {"consultation_id": global.URL.queryParams.consultation_id}, 'SAME_WINDOW')
		}catch(error){
			console.log('error',error)
			showAlert('数据写入失败！', 'error')
		}
	},
	async	knowledgeCompletion() {
		const params = {
			"model":Commom.model,
			"temperature":0.6,
			"top_p":1,
			"frequency_penalty":0,
			"presence_penalty":0,
			"stream": true,
			"messages":[{"role":"user","content":Commom.apiSearchContent}]
		}

		const ctrl = new AbortController();
		console.log('ctrl',ctrl)
		fetch_event_source.fetchEventSource('/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'bearer gpustack_c177941728a02210_1ffd564f407412369c60a51eeda159a8'
			},
			retry: false, // 完全禁用重试
			openWhenHidden: true,
			signal: ctrl.signal,
			body: JSON.stringify(params),
			onmessage:(ev)=> {
				const res = JSON.parse(ev.data)
				this.answer.text += res.choices[0].delta.content
				console.log('	this.answer.text',	this.answer.text)
			},
			onerror(err) {
				console.error('请求出错:', err);
				ctrl.abort()
				throw err 
			},
			onopen(res) {
				if (res.status !== 200) {
					console.error('连接失败，HTTP状态码:', res.status);
					return false; // 可以阻止连接
				}
				console.log('连接已打开，状态码:', res.status);
			},
			onclose() {
				console.log('连接已关闭');
			}
		});

	},
}