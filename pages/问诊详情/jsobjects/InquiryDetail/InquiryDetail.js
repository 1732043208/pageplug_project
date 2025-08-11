export default {
	triageInfo:{}, //分诊信息
	created () {
		this.getTriageRecoreds()
	},
	async getTriageRecoreds(){
		const res = await triageRecords.run()
		console.log('res',res)
		if(res.length) {
			res.forEach(item=>{
				console.log('sss',moment(item.created_at * 1000).format('YYYY-MM-DD hh:mm:ss'))
				item.ai_generated_at_format = moment( item.created_at * 1000 ).format('YYYY-MM-DD hh:mm:ss')
			})
			this.triageInfo = res[0]
		}
	}
}