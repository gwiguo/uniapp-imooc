export const Ajax = (payload) =>{
	return new Promise((reslove,reject)=>{		
			const newPayload = payload;
			newPayload.data && (newPayload.data.user_id = "6471d6b528064a7587530e15");
			// console.log(newPayload);
			uniCloud.callFunction(newPayload).then(res=>{	
				if(res.result.code == 200){
					reslove(res.result);
				}else{
					reject(res.result);
				}
			}).catch(err=>{
				reject(err);				
			})
	});
}