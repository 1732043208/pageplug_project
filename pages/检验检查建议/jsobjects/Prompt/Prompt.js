export default {
	//执行的prompt
	modelPrompt:`
	问诊结果：%InquiryMainResults%。
	附言：%InputValue%。
	知识库检索内容：%knowledgeAnswer%。
	根据问诊结果、附言及知识库检索内容，开出检验/检查处方。
	`,
}