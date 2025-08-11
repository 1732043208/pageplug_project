export default {
	triageInfo:{},  //分诊信息
	inquiryInfo:{}, //问诊信息
	created () {
		// 分诊
		this.getTriageRecoreds()
		// 问诊
		this.getInquiryRecords()
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
	}
}