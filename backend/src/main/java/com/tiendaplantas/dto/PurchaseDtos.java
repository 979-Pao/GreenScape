package com.tiendaplantas.dto;

import java.util.List;

public class PurchaseDtos {
    public static class CreatePurchaseRequest {
        private Long supplierId;
        private List<Item> items; // { plantId, quantity }

        public static class Item {
            private Long plantId;
            private int quantity;
            public Long getPlantId(){return plantId;}
            public void setPlantId(Long v){this.plantId=v;}
            public int getQuantity(){return quantity;}
            public void setQuantity(int v){this.quantity=v;}
        }

        public Long getSupplierId(){return supplierId;}
        public void setSupplierId(Long v){this.supplierId=v;}
        public List<Item> getItems(){return items;}
        public void setItems(List<Item> v){this.items=v;}
    }
}