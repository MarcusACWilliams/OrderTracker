import React, { Component } from "react";
import Dropdown from "react-dropdown";
import Modal from './modal';
import Todos from './Todos';
import AddTodo from './AddTodo';

import './css/index.css';

const uuidGenerator = require('uuid/v1');

function Child() {
  // The click event on this button will bubble up to parent,
  // because there is no 'onClick' attribute defined
  return (
    <div className="modal">
      <button>Click</button>
    </div>
  );
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            offline: false,
            currentUser: null,
            users: {},
            userNames: [],
            allOrders: [],
            orders: []
        };

        this.retreiveUsers = this.retreiveUsers.bind(this);
        this.retreiveOrders = this.retreiveOrders.bind(this);
        this.createOrder = this.createOrder.bind(this);
    }

    componentDidMount() {
        this.retreiveUsers();
        this.retreiveOrders();
    } 

    retreiveUsers() {
        
        fetch('http://127.0.0.1:3000/users')
            .then(res => res.json() )
                .then(
                    (result) => { 
                        let names = [];
                        let users = {};

                        result.forEach( (user) => { 
                            names.push(user.firstName);
                            users[user.firstName] = user;
                        });
                        this.setState({
                            userNames: this.state.userNames.concat(names),
                            users: users
                        });
                    },
                    (error) => { 
                        console.log("Throwing error");   
                    }
                )
    };

    retreiveOrders(name) {

        fetch('http://127.0.0.1:3000/orders')
            .then(res => res.json() )
                .then(
                    (result) => { 
                        let orders = [];

                        if(name == undefined || name == 'all') {

                            result.forEach( (order) => { 
                                orders.push(order);
                            });
                            
                            this.setState({
                                orders: orders,
                                allOrders: orders,
                                currentUser: null
                            });
                        }
                        else {
                            let id = this.state.users[name].id;
                            this.setState({ 
                                orders: [...this.state.allOrders.filter(todo => todo.ownerId == id)],
                                currentUser: this.state.users[name]
                            });
                        }
                        },
                            (error) => { 
                            console.log("Throwing error");   
                        }
                )
    };

    // Create Order
    createOrder(order) {
        fetch('http://127.0.0.1:3000/orders/newOrder', {
        method: 'post',
        body: JSON.stringify(order),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res => res.json(), 
                (error) => { 
                    console.log("Throwing error");   
                }
            )
    };

    // Delete
    delTodo = (id) => {
        let orderId = id;

        return fetch('http://127.0.0.1:3000/orders/deleteOrder/' + orderId, {
            method: 'delete'
        })
        .then(res => res.json() )
        .then( 
            this.setState({ orders: [...this.state.orders.filter(todo => todo.orderId !== orderId)]}) 
        ),
        (error) => { 
                    console.log("Error Deleting Object");   
                }
    }

    // Update Orders
    updOrders = (name) => {
        let user = this.state.users[name.value];
        this.retreiveOrders(name.value);
    }

    addTodo = (title, user, address, items, qty) => {
        
        let newOrder = {
          //items, orderId, owner, shippingAddress 
          "owner": title,
          "ownerId": user,
          "items": items,
          "qty": qty ? qty:'0',
          "orderId": uuidGenerator(),
          "shippingAddress": address,
          "orderDate": Date.now(),
          "deliveryDate": (Date.now() + 86400000)//One day from now...
        }

        this.setState({ orders: [...this.state.orders, newOrder]})
        this.createOrder(newOrder);
    }
    

  render() {

    return (
    <div>   {/*Top Level Container*/} 
        <Dropdown className="textbox" options={this.state.userNames} onChange={ this.updOrders} value={'Please Select User'} placeholder="Select a User" />
        <div className="section-image flex">
            <AddTodo addTodo={this.addTodo} user={this.state.currentUser}/>
            <Todos todos={this.state.orders} delTodo={this.delTodo} />
        </div> 
    </div>
    );
  }
}

export default App;
