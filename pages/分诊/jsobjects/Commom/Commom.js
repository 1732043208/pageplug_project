export default {
	model: 'medgemma-27b-it', //模型名称
	knowledge_conversation_id: '09f1cd7dfe4b47669330752ae6b3f228',  //知识库检索会话id
	knowledge_chat_id: '0b8535a8765b11f09aab6e3e429cb4e3', //知识库关联聊天助手的 ID

	model_key: 'bearer ' + 'gpustack_c177941728a02210_1ffd564f407412369c60a51eeda159a8', //模型调用秘钥
	model_params: {
		"model":Commom.model,
		"temperature":0.6,
		"top_p":1,
		"frequency_penalty":0,
		"presence_penalty":0,
		"stream": true,
		"messages":[{"role":"user","content":Commom.apiSearchContent}]
	}, //模型调用参数
	apiSearchContent: [],
}