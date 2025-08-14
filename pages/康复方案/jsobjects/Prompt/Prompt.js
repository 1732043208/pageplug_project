export default {
	//执行的prompt
	modelPrompt:`
	主述结果：%InquiryMainResults%。
	检验检查处方：%InspectionAdvice%
	诊断结果：%DiagnosisAdvice%
	附言：%InputValue%。
	根据主述结果、检验检查处方、诊断结果以及附言，给出%RequireType%。
	`,
}