// イベントの型定義
export interface Event {
  amount: number;
  reading: string;
  color?: string;
}

export interface Events {
  [key: string]: Event;
}

export interface MoveEvents {
  [key: string]: number;
}

// イベントと金額の定義
export const events: Events = {
  '一般党員になる': {
    amount: 6000,
    reading: '一般党員になる。6000円。',
    color: 'bg-blue-100'
  },
  '特別党員になる': {
    amount: 20000,
    reading: '特別党員になる。20000円。',
    color: 'bg-blue-100'
  },
  '家族党員になる': {
    amount: 3000,
    reading: '家族党員になる。3000円。',
    color: 'bg-blue-100'
  },
  '☠️': {
    amount: 10680000000,
    reading: 'カジノで負ける。106億8000万円失う。',
    color: 'bg-gray-900'
  },
  'エア党員': {
    amount: 0,
    reading: 'エア党員になった。無料。',
    color: 'bg-white'
  },
  '党員自慢': {
    amount: 0,
    reading: '親友に党員であることを自慢する。なぜだか、気まずくなり、その後疎遠になる。',
    color: 'bg-white'
  },
  'ブルーリボンバッジ': {
    amount: 162000,
    reading: '間違えて青山繁晴議員から「ブルーリボンバッジ」を購入してしまった。162000円。',
    color: 'bg-red-100'
  },
  '殉愛に涙する': {
    amount: 1760,
    reading: '感動のノンフィクション「殉愛」を購入して涙を流す。1760円。'
  },
  '党首が訴えられた': {
    amount: 10000,
    reading: '党首が訴えられた。10000円カンパする。'
  },
  '塾に入る': {
    amount: 36300,
    reading: '党首の塾に入る。ねん会費36300円。'
  },
  'アンチとの戦い': {
    amount: 0,
    reading: 'アンチとの戦いに敗れ、アカウントを削除。',
    color: 'bg-white'
  },
  'ズワイガニ': {
    amount: 18000,
    reading: '事務総長にズワイガニを差し入れる。18000円。',
  },
  '党に寄付': {
    amount: 100000,
    reading: '党に100000円寄付する。領収書の発行はなし。',
    color: 'bg-red-100'
  },
  '事務総長敗訴': {
    amount: 300000,
    reading: '事務総長が敗訴した。なんら調査せず。賠償金30万円を寄付する。',
    color: 'bg-red-100'
  },
  '情報開示請求': {
    amount: 200000,
    reading: '東大教授から訴えられる。カンパを募るが集まらない。敗訴して20万円。',
    color: 'bg-red-100'
  },
  '混浴したいなぁ': {
    amount: 1000,
    reading: '若い子と混浴したいなぁ。というポストが気持ち悪いと話題になる。なぜか、1000円スーパーチャット。'
  },
  '子宮摘出': {
    amount: 8000,
    reading: '30歳越えたら、子宮摘出発言が世界中で炎上。キリトリに違いない。スーパーチャット8000円。'
  },
  '生田さんと飲み': {
    amount: 50000,
    reading: '久しぶりに生田さんと呑みたい気分です、あたし。飲みだい、50000円を振り込む。'
  },
  'ウニ密猟': {
    amount: 100,
    reading: '党首が根室でウニを密猟。逮捕される。100円、スーパーチャット。'
  },
  'CoCo壱事件': {
    amount: 15000,
    reading: '選挙の前夜祭。一人を除いた全員分のCoCo壱を買う。15000円支払う。'
  },
  '小説購入': {
    amount: 25000,
    reading: '党首の小説を25000円分購入し、家族や親戚に配る。なぜか親戚と疎遠になる。'
  },
  'スピード違反': {
    amount: 500,
    reading: '党首がスピード違反で免停。500円、スーパーチャット。'
  },
  '被災地支援チーム': {
    amount: 40000,
    reading: '被災地支援チームに40000円寄付する。活動報告は一切なし。'
  },
  '弁護士と喧嘩': {
    amount: 500,
    reading: '代表が弁護士と喧嘩して殴り返される夢を見た。500円、スーパーチャット。'
  },
  '党費値上げ': {
    amount: 120000,
    reading: 'SFやで。こっそりと党費が「12万円」に値上げされ、自動で引き落とされる。発表はなし。',
    color: 'bg-red-100'
  },
  '恥ずかしいDM': {
    amount: 2000,
    reading: '党首の犬ぶえを、敏感に察知した支持者が30代独身女性を執拗にネットリンチ。恥ずかしいDMが公開されてしまう。キリトリだ！2000円スーパーチャット。'
  },
  '幻の党大会': {
    amount: 10000,
    reading: '幻の党大会が夢の中で開催されるが、「月500円くらいでワシを自由に使おうとするなよ」と罵倒される。10000円、スーパーチャット。'
  },
  '外国勢に買われた山': {
    amount: 25000,
    reading: '事務総長が外国勢に買われた山に観光旅行。またもや暗い気分になるが、カラ元気を出すために25000円、スーパーチャットする。'
  },
  'ホンダのバイク': {
    amount: 2500,
    reading: 'ホンダっていう会社が昔バイクを作ってたでしょ？とんでもないデマを事務総長が流してしまう。2500円、スーパーチャット。'
  },
  'ワクチン陰謀論': {
    amount: 9800,
    reading: '代表のワクチン陰謀論を盲信してしまい、イベルメクチンを購入。9800円。'
  },
  '日本端子': {
    amount: 10000,
    reading: 'いつものように、事務総長が日本端子のデマを流すも、信じたくない。デマではないはず！10000円、スーパーチャット。'
  },
  '不正選挙': {
    amount: 5000,
    reading: 'まんを辞して出馬した衆院選で党首が落選。不正選挙だ！5000円、スーパーチャット。'
  },
  'えらいことになる': {
    amount: 12000,
    reading: 'ついに事務総長がしゃんはい電力と大阪府の関係を真剣に調べると言い出した。これは、えらいことになるぞ。12000円スーパーチャット。'
  },
  '😊給料日': {
    amount: 0,
    reading: '給料日。手取り185000円。日本のためなら、と、全額寄付する。',
    color: 'bg-white'
  },
  '有料チャンネル': {
    amount: 880,
    reading: 'それでは閉めます、この後は有料チャンネルで。ニコニコ会員登録。880円。'
  },
  '宝塚の隠れ家': {
    amount: 10000,
    reading: '30代独身女性を宝塚の隠れがに連れ込もうとするが、事務総長にババちびるくらい怒られる。さすが事務総長！10000円、スーパーチャット。'
  },
  'デジタル党員証': {
    amount: 1500,
    reading: 'SFやで。待ちに待ったデジタル党員しょうが発行される。発行手数料、1500円。'
  },
  '武士の情け': {
    amount: 0,
    reading: '党首が、「これまで武士の情けで言わなかったこと全部言うことにする。みなびっくりすると思う」と言い出したが、誰もびっくりしなかった。',
    color: 'bg-white'
  },
  'BOOKOFFに売却': {
    amount: -20,
    reading: '飯山あかり、元候補の書籍「イスラム教の論理」をBOOKOFFに売却した。20円所持金が増えた。',
    color: 'bg-teal-200'
  }
};

// マスの移動イベント
export const moveEvents: MoveEvents = {
  '３マス進む': 3,
  '２マス進む': 2,
  '１マス戻る': -1
};
