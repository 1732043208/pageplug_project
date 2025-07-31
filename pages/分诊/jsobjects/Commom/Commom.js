export default {
	model:'medgemma-27b-it',
	apiSearchContent: [],
	update(value){
		console.log('Custom1.model.fileList',Custom1.model)
		Custom1.model.fileList = value
		console.log('Custom1.model.fileList',Custom1.model.fileList)
	}
}