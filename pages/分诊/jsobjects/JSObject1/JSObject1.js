export default {
	colorValue: '1',
	myFun1 (val) {
		//	write code here
		//	this.myVar1 = [1,2,3]
		console.log('11',val.selectedOptionValues)
		this.colorValue = val.selectedOptionValues.join(',')
	},
	async myFun2 () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
	},
	loadFile(val){
		console.log('val',val);
		console.log('ss',send.data)
		console.log('hhh')
	}
}