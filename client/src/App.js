import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Loader from "./components/Loader";
import Home from './Home';
import AddMed from './AddMed';
import Register from "./Register";
import Login from "./Login";
import Admin from "./Admin";
import ViewMedicines from "./ViewMedicines";
import Manufacturer from "./manufacturer"; 
import Distributor from "./distributor"; 
import Customer from "./Customer";
import Warehouse from "./warehouse"; 
import TrackOrder from "./TrackOrder"; 
import ViewOrder from "./vieworder";
import DeliveryPartner from "./deliverypartner"; 
import OrderUpdates from "./OrderUpdates";
import Sales from "./sales";
import InvoiceGenerator from "./invoicegenerator"; 
import ViewInvoice from "./viewinvoice"; 

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/distributor" exact component={Distributor} />
          <Route path="/" exact component={Home} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/addmed" component={AddMed} />
          <Route path="/warehouse" component={Warehouse} />
          <Route path="/vieworder" component={ViewOrder} />
          <Route path="/admin" component={Admin} />
          <Route path="/manufacturer" component={Manufacturer} />
          <Route path="/customer" component={Customer} />
          <Route path="/view-medicines" component={ViewMedicines} />
          <Route path="/track-order" component={TrackOrder} />
          <Route path="/view-orders" component={ViewOrder} />
          <Route path="/order-updates" component={OrderUpdates} />
          <Route path="/deliverypartner" component={DeliveryPartner} /> 
          <Route path="/sales" component={Sales} /> 
          <Route path="/invoice-generator" component={InvoiceGenerator} /> 
          <Route path="/view-invoice" component={ViewInvoice} /> 
        </Switch>
      </Router>
    </div>
  );
}

export default App;
