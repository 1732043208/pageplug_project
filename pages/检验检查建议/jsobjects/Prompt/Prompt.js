export default {
	// 知识库检索的prompt
	knowledgePrompt:``,

	//执行的prompt
	modelPrompt:`
	患者主述：%InquiryMainResults%。
	附言：%InputValue%。
	根据主述结果，开出检验/检查处方。
	`,
}