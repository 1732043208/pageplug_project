export default {
	InputValue : "",   //输入
	answerValue:"",   //回答
	changeInputValue(value){
		console.log('value',value)
		this.InputValue = value
	},
	async getCompletions(){
		this.answerValue = ''
		const res = await completions.run()
		console.log(res)
		// 正则表达式：匹配 "choices":[{"index":...,"delta":{"content":"(.*?)"
		const regex = /"choices":\[\{"index":\d+,"delta":\{"content":"([^"]*)"/g;

		// 使用 matchAll 获取所有匹配项
		const matches = [...res.matchAll(regex)];

		// 提取所有的 content 值
		const contents = matches.map(match => match[1]);

		// 打印所有 content 值
		contents.forEach((content, index) => {
			console.log(`${index + 1}. '${content}'`);
			this.answerValue +=content
		});
	},
}