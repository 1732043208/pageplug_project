export default {
	//执行的prompt
	modelPrompt:`
	患者主述：%patientStatement%。
	问诊结果：%InquiryMainResults%。
	检验检查处方：%InspectionAdvice%
	诊断结果：%DiagnosisAdvice%
	附言：%InputValue%。
	知识库检索内容：%knowledgeAnswer%。。
	根据患者主述、问诊结果、检验检查处方、诊断结果、附言以及知识库检索内容，给出%RequireType%。
	`,
}