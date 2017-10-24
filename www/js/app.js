// [NCMB] APIキー設定
var applicationKey = 'YOUR_NCMB_APPLICATION_KEY';
var clientKey = 'YOUR_NCMB_CLIENT_KEY';

// [NCMB] SDKの初期化
var ncmb = new NCMB(applicationKey, clientKey);

// ログイン中ユーザー
var currentLoginUser;

//  社員データ
var employeeData;

// 会社データ
var companyData;

// 顧客データ
var customerData; /* ポインタ含む全データ */
var customerData_relation; /* リレーションデータ */

// 削除対象のobjectId
var deleteId;

// アプリ起動時
$(function() {
    $.mobile.defaultPageTransition = 'none';
    /* 会員認証クリックイベント */
    $('#IDLoginBtn').click(onIDLoginBtn);
    $('#IDRegisterBtn').click(onIDRegisterBtn);
    $('#YesBtn_logout').click(onLogoutBtn);
    /* 顧客管理クリックイベント */
    $('#sendNewCustomerBtn').click(onSendNewCustomerBtn);
    $('#customerListReloadBtn').click(onCustomerListReloadBtn);
    /* 管理者クリックイベント */
    $('#navBtn1').click(onNavBtn1);
    $('#YesBtn_delete').click(onYesBtn_delete);
    /* 社員データ取得 */
    getEmployeeData();
    /* 会社データ取得 */
    getCompanyData();
});

// TOPページが表示されるたびに実行される処理
$(document).on('pageshow','#customerTopPage', function(e, d) {
    // 顧客リストデータ取得と更新
    getCustomerData();
});

// 新規顧客登録ページが表示されるたびに実行される処理
$(document).on('pageshow','#newCustomerRegistPage', function(e, d) {
    makeSelectForm();
});

// 会社一覧ページが表示されるたびに実行される処理
$(document).on('pageshow','#companyListPage', function(e, d) {
    makeCompanyList ();
});

// 社員一覧ページが表示されるたびに実行される処理
$(document).on('pageshow','#employeeListPage', function(e, d) {
    makeEmployeeList();
});

/********** 顧客管理 **********/
// データ取得（会社）
function getCompanyData() {
    // [NCMB] Company クラスを生成
    var company = ncmb.DataStore('Company');
    // [NCMB] Company クラス全件検索/取得
    company.order('companyNumber')
            .fetchAll()
            .then(function(results){
                // 検索/取得成功時の処理
                console.log('Company クラス全件検索/取得成功');
                companyData = results;
            })
            .catch(function(error){
                // 検索/取得失敗時の処理
                console.log('Company クラス全件検索/取得失敗：' + error);
                companyData = [];
            });
}

// データ取得（社員）
function getEmployeeData() {
    // [NCMB] Employee クラスを生成
    var employee = ncmb.DataStore('Employee');
    // [NCMB] Employee クラス全件検索/取得
    employee.order('employeeNumber')
            .fetchAll()
            .then(function(results){
                // 検索/取得成功時の処理
                console.log('Employee クラス全件検索/取得成功');
                employeeData = results;
            })
            .catch(function(error){
                // 検索/取得失敗時の処理
                console.log('Employee クラス全件検索/取得失敗：' + error);
                employeeData = [];
            });
}

// データ取得（顧客）
function getCustomerData() {
    // loading の表示
    $.mobile.loading('show');
    // 初期化
    customerData = '';
    customerData_relation = [];

    // [NCMB] Customer クラスを生成
    var customer = ncmb.DataStore('Customer');
    // [NCMB] Customer クラス全件検索/取得（ポインタ参照先オブジェクトの情報を含む）
    customer.include('company') // ★検索条件
            .order('createDate', true)
            .fetchAll()
            .then(function(results){
                // 検索/取得成功時の処理
                console.log('Customer クラス全件検索/取得成功(ポインタ含む)');
                customerData = results;
                // [NCMB] 各データのリレーション先データを全件検索/取得
                var promises = [];
                for (var i = 0; i < customerData.length; i++) {
                    promises.push(getRelationEmployeeData(i)); // [NCMB] getRelationEmployeeData(int)
                }
                /*** Promise ***/
                Promise.all(promises)
                       .then(function(relationData) {
                           // リレーション先データを検索/取得成功時の処理
                           customerData_relation = relationData;
                           // CustomerList 再生成
                           makeCustomerList();
                           // loading の表示
                           $.mobile.loading('hide');
                       });
            })
            .catch(function(error){
                // 検索/取得失敗時の処理
                console.log(error);
                customerData = [];
                alert('更新に失敗しました：' + error);
                console.log('更新に失敗しました：' + error);
                // loading の表示
                $.mobile.loading('hide');
            });
}

// リレーション先のデータを全件検索/取得
function getRelationEmployeeData(int) {
    /*** Promise ***/
    return new Promise(function(resolve, reject) {
        var data = customerData[int];
        // [NCMB] Employee クラスインスタンス生成
        var employee = ncmb.DataStore('Employee');
        // [NCMB] リレーション先 Employee クラス検索/取得
        employee.relatedTo(data, 'employee') // ★検索条件
                .fetchAll()
                .then(function(relationData){
                    // リレーション先データ検索/取得成功時の処理
                    console.log('リレーション先(Employee クラス)データ検索/取得成功');
                    resolve(relationData);
                })
                .catch(function(error){
                    // リレーション先データ検索/取得失敗時の処理
                    console.log('リレーション先(Employee クラス)データ検索/取得成功：' + error);
                    reject(error);
                });
    });
}

// 新規顧客登録フォーム「登録する」ボタン押下時の処理
function onSendNewCustomerBtn() {
    // loading の表示
    $.mobile.loading('show');
    // 各フォームから値を取得
    var companySelectVal = $('#companySelect').val();
    var employeeSelect_0 = $('#employeeSelect_0').val();
    var employeeSelect_1 = $('#employeeSelect_1').val();
    var employeeSelect_2 = $('#employeeSelect_2').val();
    var employeeSelect_3 = $('#employeeSelect_3').val();
    var employeeSelect_4 = $('#employeeSelect_3').val();
    var remarks = $('#addRemarks').val();

    // 入力チェック
    if (companySelectVal == '0' || employeeSelect_0 == '0') {
        alert('必須項目が未選択です');
        // loading の表示
        $.mobile.loading('hide');
    } else {
        // [NCMB] Company クラスを生成
        var Company = ncmb.DataStore('Company');
        // [NCMB] Employee クラスを生成
        var Employee = ncmb.DataStore('Employee');

        /*** [NCMB] ポインタデータの作成 ***/
        var pointer = new Company({"objectId": companySelectVal});

        /*** [NCMB] リレーションデータの作成 ***/
        var relation = new ncmb.Relation();
        // 関連付けする情報を作成
        var employee_0 = new Employee({"objectId": employeeSelect_0});
        // [NCMB] リレーションにオブジェクトを設定
        relation.add(employee_0);

        // [NCMB] リレーションの追加(任意設定)
        if (employeeSelect_1 != '0') {
            var employee_1 = new Employee({"objectId": employeeSelect_1});
            relation.add(employee_1);
        }
        if (employeeSelect_2 != '0') {
            var employee_2 = new Employee({"objectId": employeeSelect_2});
            relation.add(employee_2);
        }
        if (employeeSelect_3 != '0') {
            var employee_3 = new Employee({"objectId": employeeSelect_3});
            relation.add(employee_3);
        }
        if (employeeSelect_4 != '0') {
            var employee_4 = new Employee({"objectId": employeeSelect_4});
            relation.add(employee_4);
        }

        // [NCMB] Customer クラスを生成
        var Customer = ncmb.DataStore('Customer');
        // [NCMB] Customer クラスのインスタンスを生成
        var customer = new Customer();
        // [NCMB] 参照権限設定(adminRole:read & write, other: read)
        var acl = new ncmb.Acl();
        acl.setPublicReadAccess(true)
           .setRoleReadAccess('admin', true)
           .setRoleWriteAccess('admin', true);
        // [NCMB] ポインタ/リレーションデータ/ACLの設定と保存
        customer.set('company', pointer) /** ポインタ **/
                .set('employee', relation) /** リレーション **/
                .set('remarks', remarks)
                .set('acl', acl)
                .save()
                .then(function(result){
                    // 新規顧客登録成功時の処理
                    console.log('新規顧客登録成功');
                    // loading の表示
                    $.mobile.loading('hide');
                    // フォームの初期化
                    makeSelectForm();
                    // 顧客管理Top一覧ページへ移動
                    $.mobile.changePage('#customerTopPage');

                })
                .catch(function(error){
                    // 新規顧客登録失敗時の処理
                    alert('新規顧客登録失敗:' + error);
                    console.log('新規顧客登録失敗:' + error);
                    // loading の表示
                    $.mobile.loading('hide');
                });
    }
}

// 更新ボタン（顧客）
function onCustomerListReloadBtn() {
    getCustomerData();
}

/********** 権限管理 **********/
//「管理者」ボタンの設置
function setNavbar() {
    // [NCMB] adminロール取得
    ncmb.Role.equalTo('roleName', 'admin')
             .fetch()
             .then(function(role){
                 // adminロール取得成功時の処理
                 console.log('adminロール取得成功');
                 // [NCMB] adminロール内ユーザーの取得
                 return role.fetchUser();
             })
             .then(function(users){
                 // adminロール内ユーザー取得成功時の処理
                 console.log('adminロール内ユーザー取得成功');

                 for (var i = 0; i < users.length; i++) {
                     var user = users[i];
                     if (user.userName == currentLoginUser.userName) {
                         // adminユーザーの場合
                         console.log('「adminユーザーです」');
                         $('#navBtn1').show();
                     }
                 }
             })
             .catch(function(error){
                 // adminロールまたはadminロール内ユーザー取得失敗時の処理
                 console.log('adminロールまたはadminロール内ユーザー取得失敗：' + error);

             });
}

/********** 管理者機能 **********/
// 「管理者」ページ作成
function onNavBtn1() {
    // 要素削除
    $('#editCustomerList').empty();
    // リストを作成
    var dom = "";
    if (customerData.length == 0) {
        dom = "<tr><td><center>登録なし</center></td></tr>";
    } else {
        dom = "<tr style='border-right: 1px solid #ccc; border-left: 1px solid #ccc; color: #FFFFFF; background: #04162e;'>"
            + "<th scope='row'>顧客会社名</th><td scope='row'>担当者名</td></tr>";
    }

    for (var i = 0; i < customerData.length; i++) {
        var object = customerData[i];
        var object_relation = customerData_relation[i];

        var objectId = object.get('objectId');

        /* 会社 */
        var company = object.get('company');
        var companyName = company['companyName'];

        /* 社員 */
        var employeeName = '';
        for (var j = 0; j < object_relation.length; j++) {
            var data = customerData_relation[i][j].get('name');
            if (j==0) {
                employeeName = data;
            } else {
                employeeName = employeeName + ", " + data;
            }
        }

        dom = dom + "<tr id='" + objectId + "' class='deletePopup'><th>" + companyName + "</th><td>" + employeeName + "</td></tr>";
    }
    $('#editCustomerList').append(dom);
}

// 顧客情報削除確認ダイアログを表示
$(document).on('click', 'tr.deletePopup', function(){
    // id 取得
    deleteId = $(this).attr('id');
    // Popup を表示
    $('#deleteDialog')[0].click();

});

// 削除確認後「はい」を選択した場合の処理
function onYesBtn_delete() {
    // loading の表示
    $.mobile.loading('show');
    // [NCMB] Customer クラスを生成
    var customer = ncmb.DataStore('Customer');
    // [NCMB] objectId で検索
    customer.equalTo('objectId', deleteId)
            .fetch()  /* 1件検索 */
            .then(function(result){
                // 検索成功時の処理
                // [NCMB] 検索結果を削除
                result.delete()
                      .then(function(results){
                          // 削除成功時の処理
                          console.log('削除に成功しました');
                          // loading の表示
                          $.mobile.loading('hide');
                          // Top画面へ
                          $.mobile.changePage('#customerTopPage');

                    });
            })
            .catch(function(error){
                // 検索または削除失敗時の処理
                alert('検索または削除に失敗しました：' + error);
                console.log('検索または削除に失敗しました：' + error);
                // loading の表示
                $.mobile.loading('hide');
            });
}

/********** 会員認証 **********/
// 新規会員「登録する」ボタン押下時の処理
function onIDRegisterBtn() {
    // 入力フォームからID(username)とPW(password)を取得
    var username = $('#reg_username').val();
    var password = $('#IDReg_password').val();
    // loading の表示
    $.mobile.loading('show');
    // [NCMB] user インスタンスの生成
    var user = new ncmb.User();
    // [NCMB] ID / PW で新規登録
    user.set('userName', username)
        .set('password', password)
        .signUpByAccount()
        .then(function(user) {
            /* 処理成功 */
            console.log('新規登録に成功しました');
            // [NCMB] ID / PW でログイン
            ncmb.User.login(user)
                     .then(function(user) {
                         /* 処理成功 */
                         console.log('ログインに成功しました');
                         // [NCMB] ログイン中のユーザー情報の取得
                         currentLoginUser = ncmb.User.getCurrentUser();
                         var objectId = currentLoginUser.get('objectId');
                         // [NCMB] 参照権限設定(user+adminRole)
                         var acl = new ncmb.Acl();
                         acl.setReadAccess(objectId, true)
                            .setWriteAccess(objectId, true)
                            .setRoleReadAccess('admin', true)
                            .setRoleWriteAccess('admin', true);
                         // [NCMB] 更新
                         currentLoginUser.set('acl', acl)
                                         .update()
                                         .then(function(result) {
                                             /*** Promise ***/
                                             return new Promise(function(resolve, reject) {
                                                 resolve(result);
                                             });
                                         });
                     })
                     .catch(function(error) {
                         /* 処理失敗 */
                         console.log('ログインまたは更新に失敗しました: ' + error);
                         alert('ログインまたは更新に失敗しました: ' + error);
                         // フィールドを空に
                         $('#reg_username').val('');
                         $('#IDReg_password').val('');
                         // loading の表示
                         $.mobile.loading('hide');
                     })
                     .then(function(){
                         // 更新成功時の処理
                         // フィールドを空に
                         $('#reg_username').val('');
                         $('#IDReg_password').val('');
                         // loading の表示
                         $.mobile.loading('hide');
                         // 顧客管理Topページへ移動
                         $.mobile.changePage('#customerTopPage');

                     });
        })
        .catch(function(error) {
            /* 処理失敗 */
            console.log('新規登録に失敗しました：' + error);
            alert('新規登録に失敗しました：' + error);
            // フィールドを空に
            $('#reg_username').val('');
            $('#IDReg_password').val('');
            // loading の表示
            $.mobile.loading('hide');
        });
}

// 「ログインする」ボタン押下時の処理
function onIDLoginBtn() {
    // 入力フォームからID(username)とPW(password)を取得
    var username = $('#login_username').val();
    var password = $('#IDLogin_password').val();
    // loading の表示
    $.mobile.loading('show');

    // [NCMB] ID / PW でログイン
    ncmb.User.login(username, password)
             .then(function(user) {
                 /* 処理成功 */
                 console.log('ログインに成功しました');
                 // [NCMB] ログイン中のユーザー情報の取得
                 currentLoginUser = ncmb.User.getCurrentUser();
                 // 管理者ボタン設置
                 setNavbar();
                 // loading の表示終了
                 $.mobile.loading('hide');
                 // フィールドを空に
                 $('#login_username').val('');
                 $('#IDLogin_password').val('');
                 // 顧客管理Top一覧ページへ移動
                 $.mobile.changePage('#customerTopPage');
             })
             .catch(function(error) {
                 /* 処理失敗 */
                 console.log('ログインに失敗しました: ' + error);
                 alert('ログインに失敗しました: ' + error);
                 // フィールドを空に
                 $('#login_username').val('');
                 $('#IDLogin_password').val('');
                 // loading の表示終了
                 $.mobile.loading('hide');
             });
}

// 「ログアウト」ボタン押下後確認アラートで「はい」押下時の処理
function onLogoutBtn() {
    // [NCMB] ログアウト
    ncmb.User.logout();
    console.log('ログアウトに成功しました');
    // ログイン中のユーザー情報を空に
    currentLoginUser = null;
    // currentUserDataリストを空に
    $('#customerList').empty();
    // 管理者ボタンを非表示
    $('#navBtn1').css('display','none');
    // ログインページへ移動
    $.mobile.changePage('#IDLoginPage');
}

//----------------------------------画面構築-----------------------------------
// 顧客リストの生成
function makeCustomerList() {
    // 要素削除
    $('#customerList').empty();
    // リストを作成
    var dom = "";
    if (customerData.length == 0) {
        dom = "<tr><td><center>登録なし</center></td></tr>";
    } else {
        dom = "<tr style='border-right: 1px solid #ccc; border-left: 1px solid #ccc; color: #FFFFFF; background: #04162e;'>"
            + "<th scope='row'>顧客会社名</th><td scope='row'>担当者名</td></tr>";
    }

    for (var i = 0; i < customerData.length; i++) {
        var object = customerData[i];
        var object_relation = customerData_relation[i];

        var objectId = object.get('objectId');

        /* 会社 */
        var company = object.get('company');
        var companyName = company['companyName'];

        /* 社員 */
        var employeeName = "";
        for (var j = 0; j < object_relation.length; j++) {
            var data = customerData_relation[i][j].get('name');
            if (j==0) {
                employeeName = data;
            } else {
                employeeName = employeeName + ", " + data;
            }
        }

        dom = dom + "<tr class='remarks' id='" + objectId + "'><th>" + companyName + "</th><td>" + employeeName + "</td></tr>";
    }
    $('#customerList').append(dom);
}

// 「顧客リスト」押下時の処理（備考を表示）
$(document).on('click', 'tr.remarks', function(){
    // id 取得
    var objectId = $(this).attr('id');
    for (var i = 0; i < customerData.length; i++) {
        var object = customerData[i];
        var id = object['objectId'];
        if (id == objectId) {
            var remarks = object['remarks'];
            if (remarks == '') {
                alert('備考: 特記事項なし');
            } else {
                alert('備考: ' + remarks);
            }
        }
    }
});

// 新規顧客登録フォームの生成
function makeSelectForm() {
    // クリア
    $('#addRemarks').val('');
    $('#companySelect').empty();

    var domCompany = "<option value='0'>----</option>";
    for (var i = 0; i < companyData.length; i++) {
        var object = companyData[i];
        var objectId = object.get('objectId');
        var companyNumber = object.get('companyNumber');
        var companyName = object.get('companyName');
        domCompany = domCompany + "<option value='" + objectId + "'>" + companyNumber + " " + companyName + "</option>";
    }

    $('#companySelect').append(domCompany);
    $('#companySelect').selectmenu('refresh',true);

    $('#employeeSelect_0').empty();
    $('#employeeSelect_1').empty();
    $('#employeeSelect_2').empty();
    $('#employeeSelect_3').empty();
    $('#employeeSelect_4').empty();

    var domEmployee = "<option value='0'>----</option>";
    for (var i = 0; i < employeeData.length; i++) {
        var object = employeeData[i];
        var objectId = object.get('objectId');
        var employeeNumber = object.get('employeeNumber');
        var name = object.get('name');
        domEmployee = domEmployee + "<option value='" + objectId + "'>" + employeeNumber + " " + name + "</option>";
    }

    $('#employeeSelect_0').append(domEmployee);
    $('#employeeSelect_0').selectmenu('refresh',true);

    $('#employeeSelect_1').append(domEmployee);
    $('#employeeSelect_1').selectmenu('refresh',true);

    $('#employeeSelect_2').append(domEmployee);
    $('#employeeSelect_2').selectmenu('refresh',true);

    $('#employeeSelect_3').append(domEmployee);
    $('#employeeSelect_3').selectmenu('refresh',true);

    $('#employeeSelect_4').append(domEmployee);
    $('#employeeSelect_4').selectmenu('refresh',true);

    $('#employeeSelect_5').append(domEmployee);
    $('#employeeSelect_5').selectmenu('refresh',true);
}

// 会社一覧の生成
function makeCompanyList() {
    // 要素削除
    $('#companyList').empty();
    // リストを作成
    var dom = "<tr style='border-right: 1px solid #ccc; border-left: 1px solid #ccc; color: #FFFFFF; background: #04162e;'>"
            + "<th scope='row' id='companyNumber'>会社番号</th><td scope='row' id='companyName'>社名</td></tr>";
    for (var i = 0; i < companyData.length; i++) {
        var object = companyData[i];
        // 詳細情報
        var companyNumber = object.get('companyNumber');
        var companyName = object.get('companyName');

        dom = dom + "<tr id='companyNum' class='companyNum'><th>" + companyNumber + "</th><td>" + companyName + "</td></tr>";
    }

    $('#companyList').append(dom);

    // リストを更新
    $('#companyList').listview('refresh');
}

// 会社詳細ページの表示
$(document).on('click', '#companyNum', function(){
    // 要素削除
    $('#company').empty();
    //  会社一覧ページへ移動
    $.mobile.changePage('#companyPage');

    var object = companyData[$('tr.companyNum').index(this)];
    // 詳細情報
    var companyNumber = object.get('companyNumber');
    var companyName = object.get('companyName');
    var phoneNumber = object.get('phoneNumber');
    var mainOffice = object.get('mainOffice');
    var remarks = object.get('remarks');

    var dom = '<tr><th>会社番号</th><td>' + companyNumber + '</td></tr>'
            + '<tr><th>社名</th><td>' + companyName + '</td></tr>'
            + '<tr><th>電話番号</th><td>' + phoneNumber + '</td></tr>'
            + '<tr><th>本社住所</th><td>' + mainOffice + '</td></tr>'
            + '<tr><th>備考</th><td>' + remarks + '</td></tr>';

    $('#company').append(dom);

    // リストを更新
    $('#company').listview('refresh');
});

// 社員一覧の生成
function makeEmployeeList() {
    // 要素削除
    $('#employeeList').empty();
    // リストを作成
    var dom = "<tr style='border-right: 1px solid #ccc; border-left: 1px solid #ccc; color: #FFFFFF; background: #04162e;'>"
            + "<th scope='row' id='employeeNumber'>社員番号</th><td scope='row' id='name'>氏名</td></tr>";
    for (var i = 0; i < employeeData.length; i++) {
        var object = employeeData[i];
        // 詳細情報
        var employeeNumber = object.get('employeeNumber');
        var name = object.get('name');

        dom = dom + "<tr id='employeeNum' class='employeeNum'><th>" + employeeNumber + "</th><td>" + name + "</td></tr>";

    }

    $('#employeeList').append(dom);
    // リストを更新
    $('#employeeList').listview('refresh');
}

// 社員詳細ページ表示
$(document).on('click', '#employeeNum', function(){
    // 要素削除
    $('#employee').empty();
    //  社員詳細ページへ移動
    $.mobile.changePage('#employeePage');

    var object = employeeData[$('tr.employeeNum').index(this)];

    // 詳細情報
    var employeeNumber = object.get('employeeNumber');
    var name = object.get('name');
    var affiliation = object.get('affiliation');
    var emailAddress = object.get('emailAddress');
    var phoneNumber = object.get('phoneNumber');
    var remarks = object.get('remarks');

    var dom = '<tr><th>社員番号</th><td>' + employeeNumber + '</td></tr>'
            + '<tr><th>氏名</th><td>' + name + '</td></tr>'
            + '<tr><th>所属部署</th><td>' + affiliation + '</td></tr>'
            + '<tr><th>メールアドレス</th><td>' + emailAddress + '</td></tr>'
            + '<tr><th>携帯電話</th><td>' + phoneNumber + '</td></tr>'
            + '<tr><th>備考</th><td>' + remarks + '</td></tr>';

    $('#employee').append(dom);

    // リストを更新
    $('#employee').listview('refresh');
});
