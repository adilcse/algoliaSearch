/* eslint-disable handle-callback-err */
/* eslint-disable promise/always-return */
const functions = require('firebase-functions');
const admin=require('firebase-admin');
const algoliasearch=require('algoliasearch')
const ALGOLIA_APP_ID='R0CZB88STM';
const ALGOLIA_ADMIN_KEY='';
const ALGOLIA_INDEX_NAME='product_name';
const ALGOLIA_INDEX_SELLER='sellers';
const client=algoliasearch(ALGOLIA_APP_ID,ALGOLIA_ADMIN_KEY);
admin.initializeApp(functions.config().firebase);

exports.addFirebaseDataToAlgolia=functions.https.onRequest((req,res)=>{
    let products=[];
   
    // eslint-disable-next-line promise/catch-or-return
    admin.firestore().collection('products').get().then(docs=>{
        docs.forEach((doc)=>{
            let product=doc.data();
            product.objectID=doc.id;
            products.push(product);
        });
       
       const index=client.initIndex(ALGOLIA_INDEX_NAME);
       index.saveObjects(products,(err,content) => {
           res.status(200).send(content);
       })

    })
})

//add seller data to algolia

exports.addSellerDataToAlgolia=functions.https.onRequest((req,res)=>{
    let sellers=[];
   
    // eslint-disable-next-line promise/catch-or-return
    admin.firestore().collection('seller').get().then(docs=>{
        docs.forEach((doc)=>{
            let seller={
                address:doc.data().address,
                _geoloc:{
                    lat:doc.data().latLng.latitude,
                    lng:doc.data().latLng.longitude
                },
                objectID:doc.id
            };
            sellers.push(seller);
        });
       const index=client.initIndex(ALGOLIA_INDEX_SELLER);
       index.saveObjects(sellers,(err,content) => {
           res.status(200).send(content);
       })

    })
})


//auto upload new product
exports.autoUploadNewProductData=functions.firestore.document('products/{productId}').onCreate((snap,context)=>{
    const product=snap.data();
    product.objectID=context.params.productId;
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    return index.saveObject(product);
})
//auto update existing data
exports.autoUpdateProductData=functions.firestore.document('products/{productId}').onUpdate((change,context)=>{
    const product=change.after.data();
    product.objectID=context.params.productId;
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    return index.saveObject(product);
})
//auto delete product
exports.autoDeleteProductData=functions.firestore.document('products/{productId}').onDelete((snap,context)=>{
    const productId=context.params.productId;
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    return index.deleteObject(productId);
})

//auto upload new seller
exports.autoUploadNewSellerData=functions.firestore.document('seller/{sellerId}').onCreate((snap,context)=>{
    const seller=snap.data();
    seller.objectID=context.params.sellerId;
    const index = client.initIndex(ALGOLIA_INDEX_SELLER);
    return index.saveObject(seller);
})
//auto update existing seller
exports.autoUpdateSellerData=functions.firestore.document('seller/{sellerId}').onUpdate((change,context)=>{
    const seller=change.after.data();
    seller.objectID=context.params.sellerId;
    const index = client.initIndex(ALGOLIA_INDEX_SELLER);
    return index.saveObject(seller);
})
//auto delete SELLER
exports.autoDeleteSellerData=functions.firestore.document('seller/{sellerId}').onDelete((snap,context)=>{
    const sellerId=context.params.sellerId;
    const index = client.initIndex(ALGOLIA_INDEX_SELLER);
    return index.deleteObject(sellerId);
})