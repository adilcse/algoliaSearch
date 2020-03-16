/* eslint-disable handle-callback-err */
/* eslint-disable promise/always-return */
const functions = require('firebase-functions');
const admin=require('firebase-admin');
const algoliasearch=require('algoliasearch')
const ALGOLIA_APP_ID='R0CZB88STM';
const ALGOLIA_ADMIN_KEY=process.env.NODE_APP_ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_NAME='product_name';
const ALGOLIA_INDEX_SELLER='sellers';
admin.initializeApp(functions.config().firebase);
exports.addFirebaseDataToAlgolia=functions.https.onRequest((req,res)=>{
    var products=[];
   
    // eslint-disable-next-line promise/catch-or-return
    admin.firestore().collection('products').get().then(docs=>{
        docs.forEach((doc)=>{
            let product=doc.data();
            product.objectID=doc.id;
            products.push(product);
        });
        var client=algoliasearch(ALGOLIA_APP_ID,ALGOLIA_ADMIN_KEY);
       var index=client.initIndex(ALGOLIA_INDEX_NAME);
       index.saveObjects(products,(err,content) => {
           res.status(200).send(content);
       })

    })
})

//add seller data to algolia

exports.addSellerDataToAlgolia=functions.https.onRequest((req,res)=>{
    var sellers=[];
   
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
        var client=algoliasearch(ALGOLIA_APP_ID,ALGOLIA_ADMIN_KEY);
       var index=client.initIndex(ALGOLIA_INDEX_SELLER);
       index.saveObjects(sellers,(err,content) => {
           res.status(200).send(content);
       })

    })
})