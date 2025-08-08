export default {
	created () {
		Consultation.run().then(res=>{
			console.log('res',res)
		})
	},
}