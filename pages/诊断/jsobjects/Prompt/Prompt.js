export default {
	// 知识库检索的prompt
	knowledgePrompt:``,

	//执行的prompt
	modelPrompt:`
	主述结果：%InquiryMainResults%。
	检验检查处方：%InspectionAdvice%
	附言：%InputValue%。
	根据主述结果、检验检查处方、以及附言，给出诊断结果。
	`,
}