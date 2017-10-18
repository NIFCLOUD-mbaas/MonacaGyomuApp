# リレーション・権限管理機能を使いこなそう！
_2017/10/18作成_
## サンプルアプリ概要
データストア「リレーション・ポインタ」と「会員ロール・ACL」を活用したサンプルアプリです。「顧客管理」をイメージして作成しています。

* データの関連付け機能「リレーション（１対多）・ポインタ（１対１）」
  * 会社（顧客）一覧と社員一覧を登録することで、顧客（会社）ごとに担当者（社員）を割り当て一覧として管理できます
  * 顧客と担当者の登録は全ユーザー可能です
* 参照権限機能「会員ロール・ACL設定」
  * 管理者ユーザーを設定すると管理者機能を利用可能になります
  * 管理者ユーザーはユーザーが登録したデータの削除が可能になっています

## 使い方
### 事前準備
* mobile backend アカウント取得（無料）
  * http://mb.cloud.nifty.com/
* Monaca アカウント取得（無料）
  * https://ja.monaca.io/

### 動作確認準備
1. サンプルプロジェクトをダウンロードします
  * 下記 URL からローカルにダウンロードします<br>https://github.com/natsumo/MonacaGyomuApp/archive/master.zip
1. mobile backend にログインします
  * https://console.mb.cloud.nifty.com/
1. mobile backend にアプリを作成

  <img src="readme-img/make_mb_app_1.PNG" alt="make_mb_app_1" width="100px"><br><br>
  <img src="readme-img/make_mb_app_2.PNG" alt="make_mb_app_2" width="500px"><br><br>
  <img src="readme-img/make_mb_app_3.PNG" alt="make_mb_app_3" width="600px"><br><br>
  * 発行された API キー は後ほど使います（ここではOKで閉じる）
1. mobile backend に事前登録データとして「顧客（会社）」と「社員（担当者）」データ一式をインポートします
  * ダウンロードしたサンプルプロジェクトを解凍し、「Settings」フォルダ内「 `DEMO会社一覧_5件.json` 」と「 `DEMO社員一覧_10件.json` 」を次の手順でインポートします<br><br>
  <img src="readme-img/make_datastore_class_1.PNG" alt="make_datastore_class_1" width="400px"><br><br>
  <img src="readme-img/make_datastore_class_2.PNG" alt="make_datastore_class_2" width="500px"><br><br>
  <img src="readme-img/make_datastore_class_3.PNG" alt="make_datastore_class_3" width="500px"><br><br>
  <img src="readme-img/make_datastore_class_4.PNG" alt="make_datastore_class_4" width="800px"><br><br>

1. Monaca にサンプルプロジェクトをインポートします
  * Monaca にログインします<br>https://monaca.mobi/ja/login
  * ダウンロードしたサンプルプロジェクトを __zipファイル__ の状態（解凍前）で Monaca にインポートします
  * 「Import Project」をクリックします<br><br>
  <img src="readme-img/make_monaca_pjct_1.PNG" alt="make_monaca_pjct_1" width="400px"><br><br>
  <img src="readme-img/make_monaca_pjct_2.PNG" alt="make_monaca_pjct_2" width="300px"><br><br>
  <img src="readme-img/make_monaca_pjct_3.PNG" alt="make_monaca_pjct_3" width="400px"><br><br>
1. プロジェクトを開き、次の設定をしておきます
  * `js/app.js` を開く
  * プレビュー画面を横向きにする<br><br>
  <img src="readme-img/make_monaca_pjct_4.PNG" alt="make_monaca_pjct_4" width="700px"><br><br>
1. mobile backend を利用するための JavaScript SDK を導入します
  * 「`設定`」＞「`JS/CSSコンポーネントの追加と削除...`」をクリックします<br><br>
  <img src="readme-img/add_js_sdk_1.PNG" alt="add_js_sdk_1" width="700px"><br><br>
  * 「コンポーネント名」に「`ncmb`」と入力して検索し、追加します<br><br>
  <img src="readme-img/add_js_sdk_2.PNG" alt="add_js_sdk_2" width="700px"><br><br>
  * 「バージョン」は最新（デフォルト）のままインストールします<br><br>
  <img src="readme-img/add_js_sdk_3.PNG" alt="add_js_sdk_3" width="500px"><br><br>
  * 読み込むファイルにチェックを入れて保存します<br><br>
  <img src="readme-img/add_js_sdk_4.PNG" alt="add_js_sdk_4" width="300px"><br><br>
  * 導入完了です<br><br>
  <img src="readme-img/add_js_sdk_5.PNG" alt="add_js_sdk_5" width="700px"><br><br>
1. 導入した SDK を初期化します
  * `js/app.js` を開きます
  * 2,3行目の `YOUR_NCMB_APPLICATION_KEY`, `YOUR_NCMB_CLIENT_KEY` を mobile backend で発行された APIキー に書き換えます<br><br>
  <img src="readme-img/js_sdk_initialize_1.PNG" alt="js_sdk_initialize_1" width="500px"><br><br>
  * APIキー の確認方法は以下です<br><br>
  <img src="readme-img/js_sdk_initialize_2.PNG" alt="js_sdk_initialize_2" width="700px"><br><br>
  * APIキー は確実にすべてコピーして貼り付けてください
  * 正しくコピーできていない場合は動作ができません
  * 「コピー」ボタンの利用をお勧めします
  * 書き換える際は シングルクォーテーション （`'`）は消さないように注意してください

以上で準備は完了です

### 動作確認手順
大きく以下の４つに分けて説明します

1. 会員管理機能（新規登録・ログイン・ログアウト）
2. 事前登録データ（顧客(会社)・社員データ）の閲覧
3. 新規顧客担当者情報登録
4. 管理者機能（顧客担当者情報削除）

#### 1. 会員管理機能（新規登録・ログイン・ログアウト）
割愛

#### 2. 事前登録データ（顧客(会社)・社員データ）の閲覧
mobile backend にインポートしたデータを確認できます

* 「会社一覧」を選択すると会社データを一覧で確認できます<br><br>
<img src="readme-img/app_image_01.PNG" alt="app_image_01" width="400px"><br><br>
<img src="readme-img/app_image_02.PNG" alt="app_image_02" width="400px"><br><br>
* mobile backend から登録データを取得して表示しています
* 一覧から１つを選択すると詳細情報も確認できます<br><br>
<img src="readme-img/app_image_03.PNG" alt="app_image_03" width="400px"><br><br>
* 「社員一覧」も同様です<br><br>
<img src="readme-img/app_image_04.PNG" alt="app_image_04" width="400px"><br><br>
<img src="readme-img/app_image_05.PNG" alt="app_image_05" width="400px"><br><br>

#### 3. 新規顧客担当者情報登録
顧客（会社）と社員（担当者）を関連付けて登録することができます。登録したデータはトップページで一覧として確認できます。

* 「新規顧客登録」を選択すると登録ページに遷移します<br><br>
<img src="readme-img/app_image_01.PNG" alt="app_image_01" width="400px"><br><br>
<img src="readme-img/app_image_06.PNG" alt="app_image_06" width="400px"><br><br>
* １つ目プルダウンから「顧客（会社）」を１つ選択します<br><br>
<img src="readme-img/app_image_07.PNG" alt="app_image_07" width="400px"><br><br>
* この顧客（会社）リストは、先ほど確認した「会社一覧」のデータと同じものです
* ２つ目以降のプルダウンから最初に選択した「顧客（会社）」の「担当者（社員）」を選択します<br><br>
<img src="readme-img/app_image_08.PNG" alt="app_image_08" width="400px"><br><br>
  * 「担当者（社員）」に関しては１社につき複数の場合が考えられるため、５人まで選択可能にしています
* 任意で「備考」を記入して「登録する」ボタンを押します<br><br>
<img src="readme-img/app_image_09.PNG" alt="app_image_09" width="400px"><br><br>
* TOP 画面に遷移し、登録したデータのリストが表示されます<br><br>
<img src="readme-img/app_image_10.PNG" alt="app_image_10" width="400px"><br><br>
* リストをタップすると、備考に記入した内容が alert で表示されます
* 次の操作のために一度「ログアウト」しておきましょう

#### 4. 管理者機能（顧客担当者情報削除）
* 管理者ユーザーを作成します
* 会員ロール「admin」を作成して、admin ロールに所属しているユーザーを管理者として、管理者機能（データの削除）を利用できるようにします
* mobile backend でロールを作成します<br><br>
<img src="readme-img/app_image_11.PNG" alt="app_image_11" width="400px"><br><br>
<img src="readme-img/app_image_12.PNG" alt="app_image_12" width="400px"><br><br>
* ロールができら、ロールにユーザーを登録します
* ロールに登録するユーザーの「objectId」をコピーします<br><br>
<img src="readme-img/app_image_13.PNG" alt="app_image_13" width="700px"><br><br>
* ロールにユーザーを登録します<br><br>
<img src="readme-img/app_image_14.PNG" alt="app_image_14" width="700px"><br><br>
* コピーした「objectId」を貼ります<br><br>
<img src="readme-img/app_image_15.PNG" alt="app_image_15" width="400px"><br><br>
* 登録完了です<br><br>
<img src="readme-img/app_image_16.PNG" alt="app_image_16" width="700px"><br><br>
* 管理者ユーザーでログインします
* ログイン後少しすると、管理者ボタンがフッターに表示されます<br><br>
<img src="readme-img/app_image_17.PNG" alt="app_image_17" width="400px"><br><br>
* クリックします<br><br>
<img src="readme-img/app_image_18.PNG" alt="app_image_18" width="400px"><br><br>
* 削除したい登録データをクリックすると確認アラートが出ます
* 「はい」を選択します<br><br>
<img src="readme-img/app_image_19.PNG" alt="app_image_19" width="400px"><br><br>
* TOP 画面に遷移し、登録したデータのリストが更新されます<br><br>
<img src="readme-img/app_image_01.PNG" alt="app_image_01" width="400px">
