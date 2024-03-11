
let mainStoreData=[];

/* start import from firebase */

import {docName, initializeApp,firebaseConfig ,getFirestore,getCountFromServer, collection, query, where, getDocs,getDoc, setDoc, updateDoc, addDoc, doc,deleteDoc,onSnapshot,orderBy, limit,startAt,endAt } from './firebase.js';

firebase.initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const storage = firebase.storage();
/**/

let X;

async function getCit(db,X) {
const citiesCol = collection(db,`${X}`);
const citySnapshot = await getDocs(citiesCol);
const cityList = citySnapshot.docs.map(doc => doc.data());
return cityList;
};

/* end import from firebase */


let AllProductsData=[];
let StoreData=[];
let categoriesData=[];
let categoriesDataWithProducts = [];





/* start  check login and check store to edit */

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let userFromUrl = urlParams.get('user');
let userId = localStorage.getItem("menu-maker");
let storeIdFromUrl = urlParams.get('store');











if(storeIdFromUrl!==null){


  let q = query(collection(db, "storesDone"), where("id", "==", storeIdFromUrl));
  let querySnapshot = await getDocs(q);
  let mainStoreData = await querySnapshot.docs.map(doc => doc.data());
  mainStoreData=mainStoreData[0].mainStoreData;

  console.log(mainStoreData);
  showStoreData(mainStoreData);
  showCategories(mainStoreData.categoriesDataWithProducts);
  showProducts(mainStoreData.categoriesDataWithProducts,false,false);


}










if(userFromUrl!==null && userFromUrl==userId){
    let q = query(collection(db, "stores"), where("userId", "==", userId));
    let snapshot = await getCountFromServer(q);

    
    if(snapshot.data().count==0){

        let randomNumber = (Math.random()*1000000000).toFixed();

        await setDoc(doc(db,"stores",`${randomNumber}`),{
            userId: `${userId}`,
            id: `${randomNumber}`,
            name: "اسم المطعم",
            phone: "",
            address: "",
            website: "",
            logoImage: "./images/img.png",
            date: Date.now()
        }).then(e=>{
            location.href=location.origin+"?editStore="+randomNumber;
        })

    } else if (snapshot.data().count>0){
        let querySnapshot = await getDocs(q);
        let StoreData = querySnapshot.docs.map(doc => doc.data());

        // console.log(StoreData[0]);
        location.href=location.origin+"?editStore="+StoreData[0].id;

    }
    
} else if (userFromUrl!==null && userFromUrl!==userId){
    location.href="./login/login.html";
}



let StoreIdToEdit = urlParams.get('editStore');

if (StoreIdToEdit!==null && userId!==null){

    
        
    let q = query(collection(db, "stores"), where("id", "==", StoreIdToEdit));
    let snapshot = await getCountFromServer(q);


    if(snapshot.data().count!==0){
        let querySnapshot = await getDocs(q);
        StoreData = querySnapshot.docs.map(doc => doc.data());
        // console.log(StoreData);
        StoreData = StoreData[0];
        showMainStoreData(StoreData);


    } else if(snapshot.data().count==0){

        location.href="./login/login.html";
  
    }

} else if (StoreIdToEdit!==null && userId==null){
    location.href="./login/login.html";
}

/* end check login and check store to edit */



function showStoreData(StoreData){
    
    document.querySelector(".theMainName").textContent=`${StoreData.name}`;
    document.querySelector(".storeLogo").src=`${StoreData.logoImage}`;
  
    if(StoreData.address.trim()!==""){
        document.querySelector(".addressDivDad").style.display=`block`;
        document.querySelector(".address").textContent=`${StoreData.address}`;
    } else {
        document.querySelector(".addressDivDad").style.display=`none`;
    }

    if(StoreData.phone.trim()!==""){
        document.querySelector(".phoneDivDad").style.display=`block`;
        document.querySelector(".phone").textContent=`${StoreData.phone}`;
        document.querySelector(".phone").href=`tel:${StoreData.phone}`;
    } else {
        document.querySelector(".phoneDivDad").style.display=`none`;
    }

    if(StoreData.website.trim()!==""){
        document.querySelector(".websiteDivDad").style.display=`block`;
        document.querySelector(".website").textContent=`${StoreData.website}`;
        document.querySelector(".website").href=`${StoreData.website}`;

    } else {
        document.querySelector(".websiteDivDad").style.display=`none`;
    }

}

/* start show store data */




async function showMainStoreData(StoreData){

    showStoreData(StoreData)

    document.querySelector(".editStoreBtnDiv").style.display="inline-block";
    document.querySelector(".addNewProductBtnDiv").style.display="inline-block";
    document.querySelector(".editStoreLogoDad").style.display="block";
    document.querySelector(".editCategories").style.display="block";
    document.querySelector(".publishStore").style.display="block";

    let q = query(collection(db, "categories"), where("storeId", "==", StoreData.id),orderBy("date", "asc"));
    let snapshot = await getCountFromServer(q);



    if(snapshot.data().count!==0){

        let querySnapshot = await getDocs(q);
        categoriesData = querySnapshot.docs.map(doc => doc.data());
        // console.log(categoriesData);
        showCategories(categoriesData);


        

        for(let i = 0; i<categoriesData.length; i++){

          await getAllProductsFromCategorie(categoriesData[i].id).then(async products=>{
           
            categoriesDataWithProducts.push({
              name: categoriesData[i].name,
              id: categoriesData[i].id,
              date: categoriesData[i].date,
              products: products,
            });

          });

        };


        console.log(categoriesDataWithProducts);
        showProducts(categoriesDataWithProducts,true,false);



    };

};


/* end show store data */



/* start function showProducts */

async function showProducts(categoriesDataWithProducts,showEditBtn,showSallaBtn){

  let displayEditBtn=(showEditBtn?"block":"none");
  let displaySallaBtn=(showSallaBtn?"block":"none");


  document.querySelector(".categoriesCardDad").innerHTML=``;

  categoriesDataWithProducts.forEach((e)=>{


    let div = document.createElement("div");

    e.products.forEach(el=>{
      div.innerHTML+=`

      <div class="card productId_${el.id}">

        <div class="CardImgDad">
          <div class="info_productId" data-id="${el.id}">
            <img src="${el.ProductImage}" class="card-img-top cardImg" loading="lazy">
          </div>
        </div>

        <div class="card-body" style="position: relative;">

            <bdi class="card-title text-color cardName">${el.name}</bdi>
            <br>
            <bdi class="priceDad">
                
              <del class="ProductPriceBeforeRivalSpan">${el.priceBeforeRival}</del>
              <span class="price">${el.price}</span>
              <span style="font-weight: bold;">جنية</span>

            </bdi>
            <br>
            <i title="اضافه للسلة" data-id="${el.id}" class="fa-sharp fa-solid fa-cart-plus addToCard" style="display: ${displaySallaBtn}; font-size: 22px;  color: goldenrod; cursor: pointer;  border-radius: 50%;  padding: 3px 3px;  position: absolute;  bottom: -10px;  right: -10px;  transform: translate(-50%, -50%);"></i>

            <i title="تعديل المنتج" data-id="${el.id}" class="fa-sharp fa-solid fa-pen-to-square editProduct" style="display: ${displayEditBtn}; font-size: 22px;  color: black; cursor: pointer; background-color: goldenrod;  border-radius: 50%; padding: 4px 4px;  position: absolute;  bottom: -10px;  left: 20px;  transform: translate(-50%, -50%);"></i>

        </div>

     </div>
      `;

    })


    if(e.products.length>0){

      document.querySelector(".categoriesCardDad").innerHTML+=`
      
      <div style="margin-top: 20px;">
  
        <div style="display: flex; justify-content: center;">
          <h2 class="categoriesName" id="${e.id}" style="font-family: cairo; font-weight: bold; color: #e8e8e8; margin: 0 0 15px;">${e.name}</h2>
        </div>
  
  
        <div class="grid cardsDad" style="text-align: center;">
  
        ${div.innerHTML}
          
        </div>
        
      </div>
      `;

    };







  })

}



/* end function showProducts */






/* start add Categorie */

document.querySelector(".editCategories").addEventListener("click",()=>{
    ShowAllStoreCategories();
});

async function showCategories(categoriesData){
    document.querySelector(".categoriesDivDad").innerHTML=``;

    categoriesData.forEach(e=>{
      document.querySelector(".categoriesDivDad").innerHTML+=`
        
        <div style="display: inline-block;">
            <a class="categorieLink" href="#${e.id}">${e.name}</a>
        </div>
        
      `;

    });
}



async function getAllStoreCategories(){
    const q = query(collection(db, "categories"), orderBy("date","asc"));
    const querySnapshot = await getDocs(q);
    const res = querySnapshot.docs.map(doc => doc.data());
  
    return res;
};



async function getAllProductsFromCategorie(categorieId){
  let q = query(collection(db, "categories",`${categorieId}`,"products"), orderBy("date","asc"));
  let querySnapshot = await getDocs(q);
  let res = querySnapshot.docs.map(doc => doc.data());

  return res;
};
  


async function ShowAllStoreCategories() {

   
  
  
    let newSelect = document.createElement("select");
    categoriesDataWithProducts.forEach(e=>{
  
      newSelect.innerHTML+=`
      <option value="${e.id}">${e.name}</option>
      `;
  
    });
  
  
    Swal.fire({
        title: ' اقسام المتجر ',
        html: `
        
        <div class="mainForm" style="overflow-y: hidden; overflow-c: scroll; font-size: 17px!important; font-family: 'Cairo', sans-serif; font-weight: bold!important;">
  
          <label for="AllCategories">جميع الاقسام</label>
          <select style="width: 98%;" class="addOrderInput" id="AllCategories" dir="auto">
            ${newSelect.innerHTML}
          </select>
          <br>
          <button style="font-size: 18px; font-family:cairo; cursor:pointer; width: 120px; margin: 12px; border-radius: 10px; background: darkred; color: white; padding: 5px 0px; font-weight: 600; border: none;" class="RemoveCategorie">حذف قسم</button>
          <button style="font-size: 18px; font-family:cairo; cursor:pointer; width: 120px; margin: 12px; border-radius: 10px; background: green; color: white; padding: 5px 0px; font-weight: 600; border: none;" class="AddNewCategorie">اضافة قسم</button>
  
        </div>
  
        `,
        showConfirmButton: false
    });
  
};






/* start function to add new Categories  */

async function AddNewCategorie(){
    let { value: name } = await Swal.fire({
      input: 'text',
      title: 'اسم القسم',
      confirmButtonText: 'ok'
    })
  
    if(name){
      let id = (Math.random()*100000000).toFixed();
      let date = Date.now();

      await setDoc(doc(db,"categories",`${id}`),{
        storeId: StoreData.id,
        id: id,
        name: name,
        date: date,
      }).then(e=>{

        categoriesDataWithProducts.push({
          storeId: StoreData.id,
          id: id,
          name: name,
          date: date,
      });


        showCategories(categoriesDataWithProducts);

        Swal.fire('Good!','تم اضافة القسم','success')
      });
      
    };
};
  
  
/* end function to add new Categories  */
  

/* start function to delete Categories  */

async function DeleteCategorie(){

    let CategorieSelect = document.querySelector("#AllCategories");
    let CategorieNeedToRemove = CategorieSelect.value.trim();
    let CategorieNeedToRemoveName = CategorieSelect.options[CategorieSelect.selectedIndex].text;
    let CategorieDoc=doc(db, "categories", `${CategorieNeedToRemove}`);
  
    Swal.fire({
      title: "هل تريد حذف هذا القسم؟",
      html: `<h2>${CategorieNeedToRemoveName}</h2>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',    
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if(result.isConfirmed) {
  
        deleteDoc(CategorieDoc).then(e=>{

          categoriesDataWithProducts = categoriesDataWithProducts.filter(e=>e.id!==`${CategorieNeedToRemove}`);
            
          showCategories(categoriesDataWithProducts);
          showProducts(categoriesDataWithProducts,true,false);


          Swal.fire(
            'Deleted!',
            'Categorie has been deleted.',
            'success'
          );
  
        })
      };
    });
  
};
  
  
/* end function to delete Categories  */
  


/* end add Categorie */











/*  start add new Product */

document.querySelector(".addNewProduct").addEventListener("click",async ()=>{


  let newSelect = document.createElement("select");
  categoriesDataWithProducts.forEach(e=>{

    newSelect.innerHTML+=`
    <option value="${e.id}">${e.name}</option>
    `;

  });


  Swal.fire({
      title: ' اضافة منتج جديد ',
      html: `
      
      
      <div class="mainForm" style="overflow-y: hidden; overflow-c: scroll; font-size: 17px!important; font-family: 'Cairo', sans-serif; font-weight: bold!important;">

        <label for="ProductName">اسم المنتج</label>
        <input style="width: 98%;" class="addOrderInput" type="text" dir="auto" autocomplete="off" id="ProductName" >

        <label for="ProductPrice">سعر المنتج</label>
        <input style="width: 98%;" class="addOrderInput" type="text" dir="rtl" autocomplete="off" id="ProductPrice">

        <label for="ProductNote">وصف المنتج</label>
        <textarea style="width: 98%;" class="addOrderInput" rows="5" id="ProductNote" type="text" dir="auto" autocomplete="off" id="ProductNote"></textarea>
      

        <label for="ProductCategorie">القسم</label>
        <select style="width: 98%;" class="addOrderInput" id="ProductCategorie" dir="auto">
          ${newSelect.innerHTML}
        </select>

        <br><br>

        <label for="ProductImgInput" class="ProductImgLabel" style="border: none;border-radius: 20px;background: green;color: white;padding: 5px 15px;cursor: pointer;">اختر صور المنتج</label>
        <input style="width: 98%; display: none;" class="addOrderInput" accept="image/*" type="file" dir="rtl" autocomplete="off" id="ProductImgInput" multiple="multiple">

        <br><br>

        <div class="ProductImgsUploadDad" style="background: black; display: none; overflow:scroll; max-height: 250px; border: 2px solid black; border-radius: 6px; padding: 5px;">
          
        </div>

      `,
      confirmButtonText: 'اضافة',
      showCancelButton: true,
  }).then(async (result) => {    
      if (result.isConfirmed) {
          let name=document.querySelector("#ProductName").value;
          let price=document.querySelector("#ProductPrice").value;
          let description=document.querySelector("#ProductNote").value;
          let ProductImgInput = document.querySelector("#ProductImgInput");
          let ProductCategorieSelect=document.querySelector("#ProductCategorie");
          let categorieId=ProductCategorieSelect.value;
          let categorieName = ProductCategorieSelect.options[ProductCategorieSelect.selectedIndex].text;




          function idGenerator() {
            return (Math.random()*10000000).toFixed();
          };

          let id = idGenerator();


          if(name.trim()!==''&&price.trim()!==''&&categorieId.trim()!==''&&categorieName.trim()!==''){
            Swal.fire({
              title: 'Please Wait!',
              didOpen: () => {
                Swal.showLoading()
              }
            });
            uploadImageForAddNewProduct(ProductImgInput,name,price,description,id, undefined,categorieId,categorieName);
          };

      };
  });

});


/* end add new Product */





/* 1 start function to get data now */
function showDate(){
  
  const d = new Date();
  
  let year = d.getFullYear();
  let month = d.getMonth();
  let day = d.getDate();
  let hour = d.getHours();
  let mint = d.getMinutes();
  
  if(mint<10){
    mint=`0${mint}`
  }
  
  let dateNow;

  // console.log(hour)

  if (hour>=12){
    
    dateNow= `
      ${year}/${month+1}/${day}
      => ${hour-12}:${mint} PM
      `;

  } else if (hour<=11){
    
      dateNow = `
      
      ${year}/${month+1}/${day}
         ${hour}:${mint} AM
      
      `;
  }
  return dateNow;
}

/* 1 end function to get data now */











/* start function to AddNewProduct */

function AddNewProduct(name,price,description,id,ProductImage,categorieId,categorieName,ArrayOfProductImages){
  
  let dateNow = Date.now();
  
  let ProductDate = showDate();

  setDoc(doc(db,"categories",categorieId,"products",id), {
      id: id,
      name: name,
      priceBeforeRival: "",
      price: price,
      description: description,
      categorieId: categorieId,
      categorieName: `${categorieName}`,
      ProductImage: ProductImage,
      ProductDate: ProductDate,
      date: dateNow,
      ArrayOfProductImages: ArrayOfProductImages,
      isHidden: false,
    }).then(e=>{

      let categorie =  categoriesDataWithProducts.find(e=>e.id==categorieId);

      categorie.products.push({
        id: id,
        name: name,
        priceBeforeRival: "",
        price: price,
        description: description,
        categorieId: categorieId,
        categorieName: `${categorieName}`,
        ProductImage: ProductImage,
        ProductDate: ProductDate,
        date: dateNow,
        ArrayOfProductImages: ArrayOfProductImages,
        isHidden: false,
      });

      showProducts(categoriesDataWithProducts,true,false);




    });

};


/* end function to AddNewProduct */




/*  start function to editProduct */

function editProduct(productData,ProductName,ProductPrice,ProductNote,id,ProductImage,ProductCategorieId,ProductCategorieName,ArrayOfProductImages,ProductDate,date,ProductPriceBeforeRival){
  updateDoc(doc(db,"categories",ProductCategorieId,"products",id), {
      name: ProductName,
      priceBeforeRival: ProductPriceBeforeRival||"",
      price: ProductPrice,
      description: ProductNote,
      categorieId: ProductCategorieId,
      categorieName: `${ProductCategorieName}`,
      ProductImage: ProductImage,
      ProductDate: ProductDate||showDate(),
      ArrayOfProductImages: ArrayOfProductImages,
  }).then(e=>{


    let productCard = document.querySelector(`.productId_${id}`)
    console.log(productCard.querySelector(".cardImg"))
    console.log(ProductImage)

    productCard.querySelector(".cardImg").src=ProductImage;
    productCard.querySelector(".cardName").textContent=ProductName;
    productCard.querySelector(".price").textContent=ProductPrice;
    productCard.querySelector(".ProductPriceBeforeRivalSpan").textContent=ProductPriceBeforeRival.trim()==""?"":ProductPriceBeforeRival;
    
    productData.name=ProductName;
    productData.ProductImage=ProductImage;
    productData.priceBeforeRival=ProductPriceBeforeRival;
    productData.price=ProductPrice;
    productData.description=ProductNote;
    productData.categorieId=ProductCategorieId;
    productData.categorieName=ProductCategorieName;


    Swal.fire(
      'تم التعديل',
      '',
      'success'
    );

  });

};


/* end function to editProduct */










/*  start function to upload img when add new order */


async function uploadImageForAddNewProduct(input,name,price,description,id,ProductImage,categorieId,categorieName) {

let ArrayOfProductImagesOld = [];

if(input!=="noNewImg"){

  let ArrayOfProductImages = ArrayOfProductImagesOld||[];
  for(let i=0; i<input.files.length; i++){

    const ref = firebase.storage().ref();
    const file =  input.files[i];
    const name = +new Date() + "-" + file.name;
    const metadata = {
      contentType: file.type,
    };
    
    const task = ref.child(name).put(file, metadata);
    await task
    .then(async snapshot => snapshot.ref.getDownloadURL())
    .then(async url => {
    
      ArrayOfProductImages.push({src: url});
      
    })
    .catch(console.error);
    
    };

    Swal.fire("Done","","success");
    AddNewProduct(name,price,description,id, ArrayOfProductImages[0].src,categorieId,categorieName,ArrayOfProductImages);
  };


};


/* end function to upload img when add new order  */















/*  start function to upload img */


async function uploadImageForEditProduct(productData,input,ProductName,ProductPrice,ProductNote,id,ProductImage,ProductCategorieId,ProductCategorieName,ProductDate,date,ArrayOfProductImagesOld,ProductPriceBeforeRival) {

// console.log(ArrayOfProductImagesOld);

if(input!=="noNewImg"){

  let ArrayOfProductImages = ArrayOfProductImagesOld||[];
  for(let i=0; i<input.files.length; i++){

    const ref = firebase.storage().ref();
    const file =  input.files[i];
    const name = +new Date() + "-" + file.name;
    const metadata = {
      contentType: file.type,
    };
    
    const task = ref.child(name).put(file, metadata);
    await task
    .then(async snapshot => snapshot.ref.getDownloadURL())
    .then(async url => {
    
      ArrayOfProductImages.unshift({src: url});
      
    })
    .catch(console.error);
    
    };

    
    editProduct(productData,ProductName,ProductPrice,ProductNote,id, ArrayOfProductImages[0].src,ProductCategorieId,ProductCategorieName,ArrayOfProductImages,ProductDate,date,ProductPriceBeforeRival);
  };


};


/* end function to upload img */





















window.onclick=async(e)=>{





/* start remove product */
if([...e.target.classList].includes("removeProduct")){


  Swal.fire({
  title: 'Are you want to delet it?',
  text: "You won't be able to revert this!",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {

      let productId=e.target.dataset.id;
      let categorieid=e.target.dataset.categorieid;

    
      let catigorieData=categoriesDataWithProducts.find(el=>el.id==`${categorieid}`);
      
      let productDoc=doc(db,"categories",`${categorieid}`, "products", `${productId}`);

      deleteDoc(productDoc).then(e=>{

        catigorieData.products=catigorieData.products.filter(el=>el.id!==`${productId}`);

        showProducts(categoriesDataWithProducts);
  
        Swal.fire(
          'Deleted!',
          'Product has been deleted.',
          'success'
        );

      });



    }
  })


};

/* end remove product */







/* start edit product */

if([...e.target.classList].includes("editProduct")){

  let productId=e.target.dataset.id;
  let productData = categoriesDataWithProducts.flatMap(category => category.products).find(product => product.id === `${productId}`);
 

  editProductData(productData);

};



async function editProductData(productData){



  let newSelect = document.createElement("select");
  categoriesDataWithProducts.forEach(e=>{

    newSelect.innerHTML+=`
    <option value="${e.id}">${e.name}</option>
    `;

  });




  Swal.fire({
      title: 'قم بتعديل البيانات التالية',
      html: `
      
      
      <div class="mainForm" style="overflow-y: hidden; overflow-c: scroll; font-size: 17px!important; font-family: 'Cairo', sans-serif; font-weight: bold!important;">

        <label for="ProductName">اسم المنتج</label>
        <input style="width: 98%;" class="addOrderInput" type="text" dir="auto" autocomplete="off" id="ProductName" value="${productData.name}">


        <label for="ProductPriceBeforeRival">سعر المنتج قبل الخصم</label>
        <input style="width: 98%;" class="addOrderInput" type="text" dir="rtl" autocomplete="off" id="ProductPriceBeforeRival" value="${productData.priceBeforeRival==undefined?"":productData.priceBeforeRival}">


        <label for="ProductPrice">سعر المنتج</label>
        <input style="width: 98%;" class="addOrderInput" type="text" dir="rtl" autocomplete="off" id="ProductPrice" value="${productData.price}">

        <label for="ProductNote">وصف المنتج</label>
        <textarea style="width: 98%;" class="addOrderInput" rows="5" id="ProductNote" type="text" dir="auto" autocomplete="off"  value="${productData.description}">${productData.description}</textarea>


        <label for="ProductCategorie">القسم</label>
        <select style="width: 98%;" class="addOrderInput" id="ProductCategorie" dir="auto">
          <option value="${productData.categorieId}">${productData.categorieName}</option>
          ${newSelect.innerHTML}
        </select>


        <br><br>

        <label for="ProductImgInput" class="ProductImgLabel" style="border: none;border-radius: 20px;background: green;color: white;padding: 5px 15px;cursor: pointer;">اختر صور المنتج</label>
        <input style="width: 98%; display: none;" class="addOrderInput" accept="image/*" type="file" dir="rtl" autocomplete="off" id="ProductImgInput" multiple="multiple">

        <br>

        <i title="حذف" class="fa-solid fa-trash removeProduct" data-categorieid="${productData.categorieId}" data-id="${productData.id}" style="position: absolute;top: 4rem;left: 10px; font-size: 20px; color: white; background: darkred; border-radius: 50%; padding: 6px 8px; cursor: pointer;"></i>


        <div class="ProductImgsUploadDad" style="background: black; display: none; overflow:scroll; max-height: 250px; border: 2px solid black; border-radius: 6px; padding: 5px;">
        
        <p style="text-align: center;">
          Product Code ${productData.id}
        </p>


      </div>
      
      
      `,
      confirmButtonText: 'حفظ',
  }).then((result) => {    
      if (result.isConfirmed) {

          
            let ProductName=document.querySelector("#ProductName").value;
            let ProductPriceBeforeRival=document.querySelector("#ProductPriceBeforeRival").value;
            let ProductPrice=document.querySelector("#ProductPrice").value;
            let ProductNote=document.querySelector("#ProductNote").value;
            let ProductImgInput = document.querySelector("#ProductImgInput");
            let ProductCategorieSelect=document.querySelector("#ProductCategorie");
            let ProductCategorieId=ProductCategorieSelect.value;
            let ProductCategorieName = ProductCategorieSelect.options[ProductCategorieSelect.selectedIndex].text;

            let id = productData.id;

            if(ProductName.trim()!==''&&ProductPrice.trim()!==''&&ProductNote.trim()!==''&&ProductCategorieId.trim()!==''&&ProductCategorieName.trim()!==''){


              if(ProductImgInput.files[0]==undefined){

                updateDoc(doc(db,"categories",ProductCategorieId,"products",productData.id), {
                  name: ProductName,
                  priceBeforeRival: ProductPriceBeforeRival.trim()==""?"":ProductPriceBeforeRival,
                  price: ProductPrice,
                  description: ProductNote,
                  categorieId: ProductCategorieId,
                  categorieName: `${ProductCategorieName}`,
                }).then(e=>{

                  let productCard = document.querySelector(`.productId_${productData.id}`)
                  productCard.querySelector(".cardName").textContent=ProductName;
                  productCard.querySelector(".price").textContent=ProductPrice;
                  productCard.querySelector(".ProductPriceBeforeRivalSpan").textContent=ProductPriceBeforeRival.trim()==""?"":ProductPriceBeforeRival;
                  
                  productData.name=ProductName;
                  productData.priceBeforeRival=ProductPriceBeforeRival;
                  productData.price=ProductPrice;
                  productData.description=ProductNote;
                  productData.categorieId=ProductCategorieId;
                  productData.categorieName=ProductCategorieName;
             

                  Swal.fire(
                    'تم التعديل',
                    '',
                    'success'
                  );

                });

              } else {

                Swal.fire({
                  title: 'Please Wait!',
                  didOpen: () => {
                    Swal.showLoading()
                  }
                });
                uploadImageForEditProduct(productData,ProductImgInput,ProductName,ProductPrice,ProductNote,id, undefined,ProductCategorieId,ProductCategorieName,productData.ProductDate,productData.date,productData.ArrayOfProductImages,ProductPriceBeforeRival);
              }

            };
      };
  });

};

/* end edit product */















/* start btn to  edit store data */
if([...e.target.classList].includes("editStore")){
    
  Swal.fire({
    title: ' تعديل',
    html: `
    
    
    <div class="mainForm" style="overflow-y: hidden; overflow-c: scroll; font-size: 17px!important; font-family: 'Cairo', sans-serif; font-weight: bold!important;">

      <label for="StoreName">الاسم</label>
      <input style="width: 98%;" class="addOrderInput" type="text" dir="auto" autocomplete="off" id="StoreName" value="${StoreData.name}">

      <label for="StoreAddress">العنوان</label>
      <input style="width: 98%;" class="addOrderInput" type="text" dir="rtl" autocomplete="off" id="StoreAddress" value="${StoreData.address}">

      <label for="StorePhone">رقم الهاتف</label>
      <input style="width: 98%;" class="addOrderInput" type="text" dir="rtl" autocomplete="off" id="StorePhone" value="${StoreData.phone}">
    
      <label for="StoreWebsite">website</label>
      <input style="width: 98%;" class="addOrderInput" type="text" dir="rtl" autocomplete="off" id="StoreWebsite" value="${StoreData.website}">

    `,
    confirmButtonText: 'حفظ',
    showCancelButton: true,
}).then(async (result) => {    
    if (result.isConfirmed) {

        let StoreName=document.querySelector("#StoreName").value;
        let StoreAddress=document.querySelector("#StoreAddress").value;
        let StorePhone=document.querySelector("#StorePhone").value;
        let StoreWebsite = document.querySelector("#StoreWebsite").value;
        
        Swal.fire({
            title: 'Please Wait!',
            didOpen: () => {
              Swal.showLoading()
            }
        });

        // console.log(StoreData.id)
        await updateDoc(doc(db,"stores",`${StoreData.id}`),{
            name: `${StoreName}`,
            address:`${StoreAddress}`,
            phone: `${StorePhone}`,
            website: `${StoreWebsite}`,
        }).then(e=>{
            StoreData.name = `${StoreName}`;
            StoreData.address = `${StoreAddress}`;
            StoreData.phone = `${StorePhone}`;
            StoreData.website = `${StoreWebsite}`;

            showStoreData(StoreData);
            
            Swal.fire("Done","","success");
        });


    };
});

};
/* end btn to  edit store data */


/* start btn to  add Categorie */
if([...e.target.classList].includes("AddNewCategorie")){
    AddNewCategorie();
};
/* end btn to  add Categorie */
  

  
/* start btn to  Delete Categorie */
if([...e.target.classList].includes("RemoveCategorie")){
    DeleteCategorie();
  };
/* start btn to  Delete Categorie */
  

};




  


/* start change store logo */
let logoInput = document.querySelector("#logoInput");
logoInput.addEventListener("change",()=>{

    Swal.fire({
      title: 'Please Wait!',
      didOpen: () => {
        Swal.showLoading()
      }
    });
  
  
  
    let firebaseStorageUrl = document.querySelector('.storeLogo').src;
    let startIndex = firebaseStorageUrl.indexOf('o/') + 2;
    let endIndex = firebaseStorageUrl.indexOf('?alt=media');
    let filePathAndName = firebaseStorageUrl.substring(startIndex, endIndex);
    let fileName = decodeURIComponent(filePathAndName);
  
  
    let imageRef = storage.ref().child(fileName);
    // Delete the file
    imageRef.delete().then(function() {
      console.log("done")
    }).catch(function(error) {
      console.log("error")
    });
  
  
    let ref = firebase.storage().ref();
    let file = logoInput.files[0];
    let name = +new Date() + "-" + file.name;
    let metadata = {
      contentType: file.type
    };
  
    let task = ref.child(name).put(file, metadata);
    task
    .then(async snapshot => snapshot.ref.getDownloadURL())
    .then(async url => {
  
   
  
      updateDoc(doc(db, "stores", `${StoreData.id}`), {
        logoImage: url,
      }).then(e=>{
        Swal.fire("Done","","success")
        // console.log(url);
        document.querySelector('.storeLogo').src=url;
        StoreData.logoImage=url;
      })
      
  
    })
    .catch(console.error);
  
  
  });
  

/* end change store logo */





/* start save and publish */

document.querySelector(".publishStore").addEventListener("click",async (e)=>{


  Swal.fire({
    title: 'Please Wait!',
    didOpen: () => {
      Swal.showLoading()
    }
  });

  mainStoreData = { ...StoreData };

  mainStoreData.categoriesDataWithProducts=categoriesDataWithProducts;
  // console.log(mainStoreData);


  await setDoc(doc(db,"storesDone",`${mainStoreData.id}`),{
    mainStoreData: mainStoreData,
    id: mainStoreData.id,
  }).then(e=>{

    Swal.fire({
      title: ' تم الحفظ والنشر ',
      html: `
        
        <h2>Your Store Link is</h2>
        <a href="${location.origin+'?store='+mainStoreData.id}">${location.origin+'?store='+mainStoreData.id}</a>

      `,
    })
  })


});

/* end save and publish */









  





// let store = {
//     userId: "123",
//     id: "1234",
//     name: "الحلواني",
//     phone: "01111881968",
//     address: "الشرقية الزنكلون",
//     website: "www.elhalwany.store",
//     logoImage: "https://cdn-img1.imgworlds.com/assets/e3873302-212a-4c3a-aab3-c3bee866903c.jpg?key=home-gallery",
//     date: "000000"
// }

// let categorie = {
//     storeId: "1234",
//     id: "12345",
//     name: "لحوم",
//     date: "000000"
// }

// let product = {
//     categorieId: "12345",
//     id: "123456",
//     name: "دجاج مشوي",
//     image: "https://cdn-img1.imgworlds.com/assets/e3873302-212a-4c3a-aab3-c3bee866903c.jpg?key=home-gallery",
//     price: 20,
//     description: "دجاج مشوي علي الفحم",
//     date: "000000"
// }






