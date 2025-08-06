export default {
	activeEditProduct: null,
	setActiveEditProduct: (activeProduct) => {
		this.activeEditProduct = activeProduct;
	},
	generateRandomId(type, length = 10) {
		let id;

		switch (type) {
			case 'random':
				let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
				let charactersLength = characters.length;
				id = '';
				for (let i = 0; i < length; i++) {
					id += characters.charAt(Math.floor(Math.random() * charactersLength));
				}
				break;

			case 'uuid':
				id = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
																													(c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
																												 );
				break;

			default:
				return null;
		}

		return id.toString();
	},

	createProduct: async () => {
		const product = await addProduct.run();

		await addProductVariant.run({
			productId: product[0].id,
		});

		closeModal('mdl_manageProduct');

		showAlert('Product Created', 'success');
		
		getProducts.run();
	},
	
	updateProduct: async () => {
		await updateProduct.run();
		await updateProductVariant.run();
		
		closeModal('mdl_manageProduct');

		showAlert('Product Updated', 'success');
		
		this.activeEditProduct = null;
		
		getProducts.run();
	},
}