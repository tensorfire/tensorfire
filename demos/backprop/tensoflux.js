function Var(){
	return { 
		type: 'Var' 
	}
}

function Input(){
	return { 
		type: 'Input' 
	}
}

function Const(data){
	return { 
		type: 'Const', data: data 
	}
}

function Dense(input, weights){
	return { 
		type: 'Dense', 
		deps: { input, weights } 
	}
}

function Regression(input, output){
	return {
		type: 'Regression', 
		deps: { input, output },
		forward(){

		},
		backward(){

		}
	}	
}

function walk_net(net){
	var queue = [net]
	var explored = []
	while(queue.length > 0){
		var layer = queue.pop()
		for(let dep in layer.deps){
			let next = layer.deps[dep];
			if(!explored.includes(next)){
				queue.push(next)
				explored.push(next)
			}
		}	
	}
	return explored;
}

function Train(net, ...inputs){
	var layers = walk_net(net);
	var net_inputs = layers.filter(k => k.type == 'Input');
	
	for(let input of net_inputs){
		if(!inputs.some(([inp, val]) => inp === input))
			throw new Error('Missing input.');
	}
	for(let [input, value] of inputs){
		if(!net_inputs.includes(input))
			throw new Error('Extraneous input.')
	}

	

}


var X = Input(),
	Y = Input();

var syn0 = Var(),
	syn1 = Var();

var l1 = Dense(X, syn0)
var l2 = Dense(l1, syn1);

var loss = Regression(l2, Y);

Train(loss, [X, 1], [Y, 22]);