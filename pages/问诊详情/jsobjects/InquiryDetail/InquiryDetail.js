export default {
	created () {
		this.getTriageRecoreds()
	},
	async getTriageRecoreds(){
		const res = await triageRecords.run()
		console.log('res',res)
	}
}