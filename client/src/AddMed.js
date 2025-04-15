import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";

function AddMed() {
  const history = useHistory();
  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
    loadLocalMedicines();
  }, []);

  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setLoader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState();
  const [MedStage, setMedStage] = useState();
  const [MedName, setMedName] = useState("");
  const [MedDes, setMedDes] = useState("");
  const [BatchID, setBatchID] = useState("");
  const [localMedicines, setLocalMedicines] = useState([]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  };

  const loadBlockchaindata = async () => {
    setLoader(true);
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setCurrentaccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    const networkData = SupplyChainABI.networks[networkId];
    if (networkData) {
      const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
      setSupplyChain(supplychain);

      const medCtr = await supplychain.methods.medicineCtr().call();
      const med = {};
      const medStage = [];
      for (let i = 0; i < medCtr; i++) {
        med[i] = await supplychain.methods.MedicineStock(i + 1).call();
        medStage[i] = await supplychain.methods.showStage(i + 1).call();
      }
      setMED(med);
      setMedStage(medStage);
    } else {
      window.alert("The smart contract is not deployed to current network");
    }
    setLoader(false);
  };

  const loadLocalMedicines = () => {
    const storedMedicines = JSON.parse(localStorage.getItem("localMedicines")) || [];
    setLocalMedicines(storedMedicines);
  };

  const addMedicineLocally = () => {
    const newBatchID = Math.floor(1000 + Math.random() * 9000).toString();
    const newMedicine = { name: MedName, description: MedDes, batchID: newBatchID };

    const updatedMedicines = [...localMedicines, newMedicine];
    setLocalMedicines(updatedMedicines);
    localStorage.setItem("localMedicines", JSON.stringify(updatedMedicines));

    setMedName("");
    setMedDes("");
    setBatchID("");
  };

  const handlerSubmitMED = async (event) => {
    event.preventDefault();
    try {
      await SupplyChain.methods.addMedicineAutoBatchID(MedName, MedDes).send({ from: currentaccount });
      loadBlockchaindata();
    } catch (err) {
      alert("An error occurred while ordering medicine!");
    }
  };

  if (loader) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <span><b>Current Account Address:</b> {currentaccount}</span>
      <span onClick={() => history.push("/")} className="btn btn-outline-danger btn-sm btn-left"> HOME </span>
      <br /><br /><br />

      <h3>Add Medicine Locally:</h3>
      <input type="text" className="form-control-sm" value={MedName} onChange={(e) => setMedName(e.target.value)} placeholder="Medicine Name" required />
      <input type="text" className="form-control-sm" value={MedDes} onChange={(e) => setMedDes(e.target.value)} placeholder="Medicine Description" required />
      <button className="btn btn-outline-primary btn-sm" onClick={addMedicineLocally}>Add Locally</button>

      <h3>Locally Added Medicines:</h3>
      <table className="table table-bordered">
        <thead><tr><th>Name</th><th>Description</th><th>Batch ID</th></tr></thead>
        <tbody>{localMedicines.map((med, index) => (
          <tr key={index}><td>{med.name}</td><td>{med.description}</td><td>{med.batchID}</td></tr>
        ))}</tbody>
      </table>

      <h3>Order Medicine:</h3>
      <form onSubmit={handlerSubmitMED}>
        <input type="text" className="form-control-sm" onChange={(e) => setMedName(e.target.value)} placeholder="Medicine Name" required />
        <input type="text" className="form-control-sm" onChange={(e) => setMedDes(e.target.value)} placeholder="Medicine Description" required />
        <button className="btn btn-outline-success btn-sm">Order</button>
      </form>
    </div>
  );
}

export default AddMed;
