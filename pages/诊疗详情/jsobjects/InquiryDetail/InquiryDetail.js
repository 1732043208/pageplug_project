export default {
	triageInfo:null,  //分诊信息
	inquiryInfo:null, //问诊信息
	InspectionAdviceInfo:null, //检查检验信息
	DiagnosisInfo:null, //诊断信息
	TreatInfo:null, //治疗方案
	recoveryInfo:null, //康复方案
	created () {
		// 分诊
		this.getTriageRecoreds()
		// 问诊
		this.getInquiryRecords()
		//检验检查建议
		this.getInspectionAdviceRecords()
		// 诊断
		this.getDiagnosisRecords()
		//治疗方案
		this.getTreatRecords()
		//康复方案
		this.getRecoveryRecords()
	},
	// 分诊
	async getTriageRecoreds(){
		const res = await triageRecords.run()
		console.log('getTriageRecoreds',res)
		if(res.length) {
			res.forEach(item=>{
				item.ai_generated_at_format = moment( item.created_at * 1000 ).format('YYYY-MM-DD hh:mm:ss')
			})
			this.triageInfo = res[0]
		}
	},
	// 问诊
	async getInquiryRecords(){
		const res = await InquiryRecords.run()
		console.log('getInquiryRecords',res)
		if(res.length) {
			res.forEach(item=>{
				item.ai_generated_at_format = moment( item.created_at * 1000 ).format('YYYY-MM-DD hh:mm:ss')
			})
			this.inquiryInfo = res[0]
		}
	},
	//检验检查建议
	async getInspectionAdviceRecords(){
		const res = await InspectionAdviceRecords.run()
		console.log('getInspectionAdviceRecords',res)
		if(res.length) {
			res.forEach(item=>{
				item.ai_generated_at_format = moment( item.created_at * 1000 ).format('YYYY-MM-DD hh:mm:ss')
			})
			this.InspectionAdviceInfo = res[0]
		}
	},
	//诊断
	async getDiagnosisRecords(){
		const res = await DiagnosisRecords.run()
		console.log('getDiagnosisRecords',res)
		if(res.length) {
			res.forEach(item=>{
				item.ai_generated_at_format = moment( item.created_at * 1000 ).format('YYYY-MM-DD hh:mm:ss')
			})
			this.DiagnosisInfo = res[0]
		}
	},
	//治疗方案
	async getTreatRecords(){
		const res = await TreatRecords.run()
		console.log('getTreatRecords',res)
		if(res.length) {
			res.forEach(item=>{
				item.ai_generated_at_format = moment( item.created_at * 1000 ).format('YYYY-MM-DD hh:mm:ss')
			})
			this.TreatInfo = res[0]
		}
	},
	//康复方案
	async getRecoveryRecords(){
		const res = await recoveryRecords.run()
		console.log('getRecoveryRecords',res)
		if(res.length) {
			res.forEach(item=>{
				item.ai_generated_at_format = moment( item.created_at * 1000 ).format('YYYY-MM-DD hh:mm:ss')
			})
			this.recoveryInfo = res[0]
		}
	},
}