# 第五世代対戦アーカイブ — GIF付きローカル試作

ZIPを展開し、index.html をブラウザーで開きます。画像は image/bw/ にあります。添付のShowdownアーカイブに入っていた686ファイルを収録しています。GitHub Pagesで公開している版とは別のフォルダーです。

## 新しい大会で画像を使う

data.js の pokemonSpriteFiles で、大会のKP表とパーティに使うポケモン名をGIFファイル名に対応させます。すでに登録済みの名前は追加の設定なしで使えます。未登録の名前だけ、既存の組と同じ形式で追記します。たとえばフーディンなら ["フーディン", "alakazam.gif"] です。フォルムは表示名ごとに登録します。名前の表記は大会データと揃えてください。

大会情報と上位パーティは data.js の tournaments、全登録パーティは all-parties-data.js の allPartiesByEvent に追加します。大会IDは両方で同じ値を使います。
大会ごとの参加者数は data.js の大会データに participantCount として記入します。第3回関東BWオフは 44 です。
