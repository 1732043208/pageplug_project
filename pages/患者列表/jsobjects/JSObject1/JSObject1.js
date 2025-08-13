export default {
	async naviagteToDetail () {
		const res = await selectInquiry.run()
		console.log('res',res)
		navigateTo('诊疗详情', {
			"consultation_id": res[0].consultation_id,
			"patient_id":res[0].patient_id
		}, 'SAME_WINDOW');
	}
}