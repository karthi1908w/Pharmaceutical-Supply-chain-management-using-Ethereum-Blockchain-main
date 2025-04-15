// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    struct Product {
        uint id;
        string name;
        uint price;
        address manufacturer;
        address distributor;
        bool purchased;
    }

    mapping(uint => Product) public products;
    uint public productCount = 0;

    event ProductCreated(uint id, string name, uint price, address manufacturer);
    event ProductPurchased(uint id, address distributor);

    function createProduct(string memory _name, uint _price) public {
        require(_price > 0, "Price must be greater than zero");
        productCount++;
        products[productCount] = Product(productCount, _name, _price, msg.sender, address(0), false);
        emit ProductCreated(productCount, _name, _price, msg.sender);
    }

    function purchaseProduct(uint _id) public payable {
        Product storage product = products[_id];
        require(product.id > 0 && product.id <= productCount, "Invalid product ID");
        require(!product.purchased, "Product already purchased");
        require(msg.value >= product.price, "Insufficient funds");
        require(product.manufacturer != msg.sender, "Manufacturer cannot buy their own product");

        product.distributor = msg.sender;
        product.purchased = true;

        payable(product.manufacturer).transfer(product.price);
        emit ProductPurchased(_id, msg.sender);
    }
}
