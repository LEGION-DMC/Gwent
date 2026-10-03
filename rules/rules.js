const rulesData = {
    target: {
        title: 'Цель и Процесс игры',
        description: 'Основные принципы и правила сражения',
        type: 'rule',
        content: `
		    <p style="text-align: center;">Гвинт — это дуэль двух армий, где победа зависит от стратегического планирования и умения управлять своей колодой.</p>
            <div class="bloc-rule"><div><p>Игроки ходят по очереди, выкладывая на поле по одной карте. В конце каждого раунда подсчитывается общая сила всех карт отрядов, размещённых на поле каждого из игроков</p></div></div>
            <div class="bloc-rule"><div><h3>Главная цель</h3><p><strong>Выиграть два раунда из трёх.</strong> Матч состоит из трёх раундов. Игрок, который побеждает в двух раундах, объявляется победителем матча.</p></div></div>
            <div class="bloc-rule"><div><h3>Время хода</h3><ul><li>На ход каждому даётся по 1 мин.</li><li>При первом бездействие, следует наказание: вы теряете 1 карту с руки (карта отправляется в Сброс)</li><li>При последующем бездействии: следует автоматическое поражение в раунде.</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Пас (Пропуск хода)</h3><ul><li>Игрок может объявить пас в любой свой ход</li><li>После паса игрок больше не может разыгрывать карты в этом раунде и пропускает все свои последующие ходы</li><li>Раунд продолжается, пока оба игрока не объявят пас</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Определение победителя</h3><ul><li>В конце раунда сравнивается <strong>общая сила</strong> всех карт отрядов на поле у каждого игрока.</li><li>Игрок с <strong>большей суммой силы</strong> выигрывает раунд.</li><li>При равной сумме силы раунд считается ничейным. И победа засчитывается обоим игрокам.</li><li>Игра заканчивается, как только один из игроков выигрывает два раунда.</li></ul><p style="font-style: italic;"><strong style="color: red;">Важно:</strong> Фракция <strong>Нильфгаард</strong> получает победу в раунде при ничейном счёте.</p></div></div>
        `
    },
    faction: {
        title: 'Выбор Фракции',
        description: 'Противоборствующие фракции и их особенности',
        type: 'rule',
        content: `
            <p style="text-align: center;">У каждой фракции своя история, культура и уникальные способы ведения боя</p>
            <div class="bloc-rule"><img src="faction/nilfgaard/logo_faction.png" alt="Нильфгаард" class="rule-modal__image"><div class="faction"><h3>Нильфгаард</h3><p>Вся Большая земля дрожит от чеканного шага тяжеловооруженных нильфгаардских пехотинцев. За ними следом движутся плюющие огнем боевые машины, златоустые эмиссары, наемные убийцы с окровавленными стилетами, покрытыми ядом. Жители Севера с ужасом наблюдают за этим походом из-за полуприкрытых ставен и шепчут слова молитвы: «Мелитэле, Добрая Мать, сохрани нас от зла, не дай Черным потравить нив наших, не дай им заковать в цепи чад наших...» Но судя по высоким столбам дыма вдоль Понтара и Яруги, богиня глуха к этим мольбам.</p><p style="color: #796fc0; font-style: italic;"><strong>Способность фракции:</strong> При равном счёте по окончании раунда победа засчитывается игравшему данной фракцией.</p></div></div>
            <div class="bloc-rule"><img src="faction/realms/logo_faction.png" alt="Королевства Севера" class="rule-modal__image"><div class="faction"><h3>Королевства Севера</h3><p>Ни при одном дворе, ни в одной библиотеке, ни в одной академии нет точной карты Королевств Севера. Ибо стоит картографу провести последнюю черту, как один из многочисленных королей, принцев или маркграфов уже атакует соседа и переносит границу. Без конца кто-то с кем-то воюет: то Аэдирн с Каэдвеном, то Темерия с Лирией... Однако ж эта безумная грызня дает закалку. Жители Севера — искусные воины, стойкие и привыкшие к лишениям. Нелегко разбить их, особенно когда им случается забыть о раздорах и встать плечом к плечу против врага. Однако, как только нордлинги одерживают победу, они снова бросаются друг на друга...</p><p style="color: #796fc0; font-style: italic;"><strong>Способность фракции:</strong> После победы в раунде, добирается 1 карты из колоды</p></div></div>
            <div class="bloc-rule"><img src="faction/monsters/logo_faction.png" alt="Чудовища" class="rule-modal__image"><div class="faction"><h3>Чудовища</h3><p>Людям нравится думать, что они хозяева Большой земли. Но достаточно сойти с привычного большака или навострить ухо во время полнолуния, как станет ясно, насколько далека эта мысль от истины. Посреди лесной чащи, в тенистых оврагах и сырых погребах покинутых домов сверкает множество глаз и мокрых от слюны клыков. Стаи чудовищ только и ждут подходящей минуты, чтобы выйти на охоту. Обычно, ведомые жаждой крови, они нападают безрассудно, и только поэтому от них удается отбиться. Но если кто-то стоит у них во главе, если кто-то отдает им приказы... Тогда не спасают ни толстые стены, ни щиты, ни оружие. Льется людская кровь, а ночной воздух пронзают вопли ужаса.</p><p style="color: #796fc0; font-style: italic;"><strong>Способность фракции:</strong> По завершении каждого раунда, сохраняется 1 случайная разыгранная карта и возвращается в руку.</p></div></div>
            <div class="bloc-rule"><img src="faction/scoiatael/logo_faction.png" alt="Скоя'таэли" class="rule-modal__image"><div class="faction"><h3>Скоя'таэли</h3><p>Когда-то Большой землей владели Старшие расы: эльфы, краснолюды, гномы. Люди оттеснили их в захолустье, в горы, в густые леса — и ждут, пока те вымрут от голода и болезней, чтобы вырвать у них из рук эти последние, бесплодные клочки земли. Но некоторые эльфы и краснолюды ищут иной смерти: с песней на устах, с людской кровью на руках. На пояса и шапки они вешают беличьи хвосты и таятся вдоль большаков, готовые убить всех dh'oine на своем пути. Они знают, что никогда не победят, не возьмут верх над своими угнетателями. Но это вовсе не ослабляет их желания бунтовать, а лишь усиливает его. В конце концов, скоя'таэлям нечего терять.</p><p style="color: #796fc0; font-style: italic;"><strong>Способность фракции:</strong> За фракцией закреплено право выбора первого хода в каждом раунде.</p></div></div>
            <div class="bloc-rule"><img src="faction/skellige/logo_faction.png" alt="Скеллиге" class="rule-modal__image"><div class="faction"><h3>Скеллиге</h3><p>В сотнях миль от восточного побережья Большой земли лежат острова Скеллиге. В сравнении с Королевствами Севера или Нильфгаардской империей они столь малы, что выглядят кляксой на карте. Как же им удалось так долго хранить независимость? Что ж, раньше многие пытались захватить Скеллиге. Останки их кораблей до сих пор торчат среди скал, а воины-островитяне пьют мед из их заржавленных шлемов. Однако вот уже несколько десятилетий никто не пробует завоевать острова, и это беспокоит их жителей. Как же им показать себя, покрыть себя славой, заполучить место за столом предков? Воинам Скеллиге не остается ничего другого, кроме как сесть на драккары и, воодушевляясь песнями, отправиться по бурному морю к плодородным равнинам в поисках крови и добычи...</p><p style="color: #796fc0; font-style: italic;"><strong>Способность фракции:</strong> В третьем раунде 2 случайные карты из Сброса возвращаются в руку.</p></div></div>
            <div class="bloc-rule"><img src="faction/syndicate/logo_faction.png" alt="Синдикат" class="rule-modal__image"><div class="faction"><h3>Синдикат</h3><p>Одни сражаются за честь, а другие — за империю. Одни сражаются за короля, а другие — за свободу. Те, кто состоит в Синдикате, не станут сражаться ни за что, кроме богатства. Если щедро им заплатить, они будут готовы для вас на любые деяния… Даже самые чудовищные. Чтобы набить свой кошель и заработать репутацию на улицах Новиграда, приходится идти на преступления. Городская экономика построена на новиградской кроне, но в преступном мире в ходу другая валюта. Те, кто платит ею за услуги или получает ее в качестве платежа, связывают себя непреложным обетом, нарушение которого влечет за собой суровую кару. Всякий глупец, посмевший не сдержать слово, вскоре дорого за это заплатит.</p><p style="color: #796fc0; font-style: italic;"><strong>Способность фракции:</strong> На этапе Муллигана может заменить до 3 карт (вместо стандартных 2).</p></div></div>
            <div class="bloc-rule"><img src="faction/neutral/logo_faction.png" alt="Нейтралитет" class="rule-modal__image"><div class="faction"><h3>Нейтральные карты</h3><p style="font-style: italic; color: red;"> Данные карты, не принадлежащие ни одной из фракций и доступны всем</p></div></div>
        `
    },
    deckBuilding: {
        title: 'Сбор колоды',
        description: 'Правила и ограничения при создании колоды',
        type: 'rule',
        content: `
            <p style="text-align: center;">Правила составления колоды определяют баланс и разнообразие игры</p>
            <div class="bloc-rule"><div><h3>Ограничения по количеству карт</h3><ul><li><strong>Максимальное количество всех карт в колоде:</strong>  40 карт</li><li><strong>Минимальное количество карт отрядов:</strong> 22 карт</li><li><strong>Максимальное количество специальных карт:</strong>  10 карт</li></ul></div></div>
            <div><h3>Типы карт в колоде</h3>
            <div class="bloc-rule"><img src="deck/unit.png" alt="Отряды" class="rule-modal__image"><div class="cards"><h3>Отряды</h3><p>Основные боевые единицы, которые размещаются на поле боя и имеют очки Силы. После размещения на поле боя карта отряда добавляет к общей силе войск количество очков, указанное в её левом верхнем углу.</p><p><strong>Особенности:</strong></p><ul><li>Имеют числовое значение силы (от 1 до 10)</li><li>Размещаются на поле в одном из трёх боевых рядов</li><li>Остаются на поле до конца раунда</li><li>Среди карт Отрядов, есть карты <strong>Героев</strong> - данные карты не подвержены ослаблению, усилению и уничтожению. На них не действуют способности карт: Погоды, Казнь, Чучело и другие эффекты, которые могут изменить их силу или удалить с поля.</li><li>Среди карт Отрядов, есть карты <strong>со способностями</strong> - данные карты как и специальные карты, могут усиливать другие отряды, либо призывать другие карты из колоды и руки.</li></ul></div></div>
            <div class="bloc-rule"><img src="deck/special.png" alt="Специальные" class="rule-modal__image"><div class="cards"><h3>Специальные</h3><p>Специальные карты, которые оказывают немедленный эффект.</p><p><strong>Особенности:</strong></p><ul><li>Не имеют силы и не размещаются на поле (за исключением погодных карт и Чучела)</li><li>Эффект применяется мгновенно при розыгрыше</li><li>После применения - отправляются в Сброс</li><li>Могут наносить урон и усиливать карты Отрядов</li></ul><p><strong>Карты Погоды: Особый класс Специальных карт</strong></p><ul><li>Размещаются на поле, в особом слоте</li><li>Эффект применяется мгновенно при розыгрыше</li><li>Карта после применения остаётся на поле до конца раунда, или пока карта не будет заменена или отменена другой</li><li>Несут негативный эффект для карт Отрядов</li></ul></div></div>
            <div class="bloc-rule"><img src="deck/artifact.png" alt="Артефакты" class="rule-modal__image"><div class="cards"><h3>Артефакты</h3><p>Мощные предметы, которые остаются на поле боя и оказывают постоянный эффект.</p><p><strong>Особенности:</strong></p><ul><li>Размещаются на поле, занимая место в боевых рядах</li><li>Эффект применяется мгновенно при розыгрыше</li><li>Карта после применения остаётся на поле до конца раунда, или пока карта не будет уничтожена</li><li>Могут усиливать отряды, давать пассивные бонусы или особые способности</li></ul></div></div>
            <div class="bloc-rule"><img src="deck/tactic.png" alt="Тактики" class="rule-modal__image"><div class="cards"><h3>Тактики</h3><p>Стратегические карты, применяют групповые или масштабные эффекты</p><p><strong>Особенности:</strong></p><ul><li>Размещаются на поле, в особом слоте</li><li>Эффект действует разово, и карта при этом остаётся на поле до конца раунда</li><li>Могут усиливать отряды, давать пассивные бонусы или особые способности</li><li>Применяются на целые ряды для группы карт или карт с определённым тегом</li></ul></div></div></div>
        `
    },
    cardAbilities: {
        title: 'Способности карт',
        description: 'Все способности карт',
        type: 'rule',
        content: `
            <p style="text-align: center;">Способности определяют, как карта влияет на ход сражения.</p>
            <div id="abilitiesCatalog"></div>
        `
    },
    preparation: {
        title: 'Подготовительные этапы',
        description: 'Этапы перед началом сражения',
        type: 'rule',
        content: `
            <p style="text-align: center;">Перед началом основного сражения происходят несколько важных подготовительных этапов</p>
            <div class="bloc-rule"><div><h3>1. Определение первого хода</h3><p>Случайное определение очерёдности хода путём подбрасывания монеты.</p><p><strong>Результат:</strong></p><ul><li>Крепость: Игрок ходит первым в первом раунде</li><li>Факел: Противник ходит первым в первом раунде</li></ul><p style="font-style: italic;"><strong style="color: red;">Важно:</strong> В следующих раундах первым ходит победивший в предыдущем раунде.</p></div></div>
            <div class="bloc-rule"><div><h3>2. Стартовая раздача</h3><p><strong>Процесс:</strong> Каждому игроку раздаётся 10 случайных карт из собранной колоды.</p><h4>Особенности раздачи в разных режимах игры:</h4><div class="bloc-rule"><div><h5>Классический режим</h5><ul><li>10 карт со стартовой раздачи на всю игру</li><li>Дополнительные карты не добираются</li><li>Стратегия требует тщательного планирования</li></ul></div></div><div class="bloc-rule"><div><h5>Режим CD Project Red</h5><ul><li>Стартовая раздача: 10 карт</li><li>В каждом раунде добор 3-х карт, максимально до 10 в руке</li><li>Добор происходит в начале каждого раунда</li></ul></div></div></div></div>
            <div class="bloc-rule"><div><h3>3. Муллиган</h3><p><strong>Что это:</strong> Фаза замены карт перед началом первого раунда.</p><p><strong>Правила:</strong></p><ul><li>Каждый игрок может заменить до 2 карт из стартовой руки</li><li>Заменённые карты возвращаются в колоду</li></ul><p style="font-style: italic;"><strong style="color: red;">Важно:</strong> Королевства Севера: Могут заменить до 3 карт</p><p style="font-style: italic;"><strong style="color: red;">Важно:</strong> Синдикат: Может отменить Муллиган противника</p></div></div>
        `
    },
    rows: {
        title: 'Боевые ряды',
        description: 'Размещение карт на поле боя',
        type: 'rule',
        content: `
            <p style="text-align: center;">Поле боя разделено 6 рядов, по 3 для игрока и противника</p>
            <div class="bloc-rule"><div><h3>Правила размещения</h3><ul><li>Каждый ряд вмещает до 9 карт</li><li>В свой ход, можно разместить только одну карту</li><li>Размещаемые на поле отряды, подразделяются на:</li><ul><li><strong>Дружественные:</strong> Отряды размещённые на стороне игрока.</li><li><strong>Вражеские:</strong> Отряды размещённые на стороне противника.</li><li><strong>Шпионы:</strong> Отряды игрока или противника, размещённые не на своей стороне.</li></ul></ul></div></div>
            <div class="bloc-rule"><img src="deck/close-row.png" alt="Ближний бой" class="rule-modal__image"><div><h3>Ближний бой</h3><p>Первый ряд для карт ближнего боя.</p><p><strong>Типичные отряды:</strong></p><ul><li>Пехота</li><li>Рыцари</li><li>Воины с мечами и топорами</li></ul></div></div>
            <div class="bloc-rule"><img src="deck/ranged-row.png" alt="Дальний бой" class="rule-modal__image"><div><h3>Дальний бой</h3><p>Второй ряд для карт дальнего боя.</p><p><strong>Типичные отряды:</strong></p><ul><li>Лучники</li><li>Арбалетчики</li><li>Маги</li></ul></div></div>
            <div class="bloc-rule"><img src="deck/siege-row.png" alt="Осадные ряд" class="rule-modal__image"><div><h3>Осадные орудия</h3><p>Третий ряд для осадных орудий и поддержки.</p><p><strong>Типичные отряды:</strong></p><ul><li>Орудия</li><li>Гиганты</li><li>Маги поддержки</li></ul></div></div>
            <div class="bloc-rule"><img src="deck/any-row.png" alt="Гибрид" class="rule-modal__image"><div><h3>Гибридные отряды</h3><p>Возможно размещение в любом из доступных рядов.</p><p><strong>Типичные отряды:</strong></p><ul><li>Разведчики</li><li>Некоторые Герои</li><li>Элитные отряды</li></ul></div></div>
			<div class="bloc-rule"><img src="deck/hidden-all-row.png" alt="Шпионы" class="rule-modal__image"><div><h3>Шпионы</h3><p>Размещение согластно позиции отряда, но на сторонге противника.</p><p><strong>Типичные отряды:</strong></p><ul><li>Разведчики</li><li>Дипломаты</li><li>Наёмные убийцы</li></ul></div></div>
		`
    },
    interaction: {
        title: 'Взаимодействие и управление',
        description: 'Управление игрой и интерфейсом',
        type: 'instruction',
        content: `
            <p style="text-align: center;">Основные элементы управления и взаимодействия с игровым интерфейсом</p>
            <div class="bloc-rule"><div><h3>Общее управление</h3><ul><li><strong>Esc:</strong> Возврат в меню или к предыдущему экрану.</li><li><strong>Клик вне окна:</strong> Закрытие окна подробной информации.</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Сбор колоды</h3><ul><li><strong>ЛКМ (Левая кнопка мыши) по карте:</strong> Добавление/Удаление карты из колоды.</li><li><strong>ПКМ (Правая кнопка мыши) по карте:</strong> Просмотр подробной информации о карте.</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Сохранение и загрузка колоды</h3><ul><li>Возможно сохранение колоды в локальный файл.</li><li>Возможна загрузка колоды из локального файла.</li><li><strong>Важно:</strong> Каждая фракция имеет отдельные файлы сохранения. Нельзя загрузить колоду другой фракции.</li><li>Файлы сохраняются в формате JSON.</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Взаимодействие с картами на поле</h3><ul><li><strong>ЛКМ (Левая кнопка мыши) по карте в руке:</strong> Выбор карты для размещения на поле боя.</li><li><strong>ПКМ (Правая кнопка мыши) по карте:</strong> Просмотр подробной информации о карте.</li><li><strong>Нажатие на стопку карт:</strong> Просмотр карт в Колоде/Сбросе (так же доступен Сброс противника).</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Размещение карт на поле боя</h3><ul><li>После выбора карты из руки, доступные ряды будут подсвечены.</li><li>Для размещения карты в ряду достаточно нажать на сам ряд.</li><li>Для размещения в определённой позиции в ряду необходимо нажать справа, слева или между уже размещёнными картами.</li></ul></div></div>
        `
    },
    terms: {
        title: 'Термины и Обозначения',
        description: 'Термины, понятия и обозначения',
        type: 'instruction',
        content: `
            <p style="text-align: center;">Словарь основных терминов, которые помогут лучше понимать игру.</p>
            <div class="bloc-rule"><div><h3>Игровое поле</h3><ul><li><strong>Колода:</strong> Неразыгранные карты.</li><li><strong>Рука:</strong> Карты, которые игрок может разыграть в текущем раунде.</li><li><strong>Поле:</strong> Область, где размещаются карты.</li><li><strong>Сброс:</strong> Карты, которые были разыграны в предыдущем раунде, уничтожены или сброшены.</li><li><strong>Удаление:</strong> Карты, удалённые из сражения полностью, минуя Сброс. Вернуть их в игру, как правило, невозможно.</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Игровые действия</h3><ul><li><strong>Пас:</strong> Пропуск хода, после которого игрок не может играть карты в этом раунде.</li><li><strong>Муллиган:</strong> Замена карт в стартовой руке перед первым раундом.</li><li><strong>Добор:</strong> Взятие карты из колоды в руку.</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Стратегические термины</h3><ul><li><strong>Адвантаж (преимущество):</strong> Ситуация, когда у игрока больше карт в руке, чем у противника.</li><li><strong>Драй-Пас:</strong> Пас на пустой стол, с целью вынудить противника сбросить карту в текущем раунде, чтобы получить преимущество в следующем.</li><li><strong>Синергия:</strong> Взаимное усиление карт при совместном использовании.</li></ul></div></div>
            <div class="bloc-rule"><div><h3>Визуальные обозначения</h3><p><strong>Сила отрядов:</strong> Цвет числового значения силы карты отряда указывает на её текущее состояние относительно изначальной силы:</p><ul style="list-style: none;"><li><strong style="color: #ff4444; font-size: 18px;">●</strong><strong style="color: #ff4444;">Красный</strong> — <span style="color: #ff4444;">повреждённый отряд</span> (текущая сила меньше изначальной).</li><li><strong style="color: #ffffff; font-size: 18px;">●</strong><strong style="color: #ffffff;">Белый</strong> — <span style="color: #ffffff;">отряд с изначальной силой.</span></li><li><strong style="color: #0ba00b; font-size: 18px;">●</strong><strong style="color: #0ba00b;">Зелёный</strong> — <span style="color: #0ba00b;">усиленный отряд</span> (текущая сила больше изначальной).</li></ul></div></div>
        `
    },
	glossary: {
		title: 'Глоссарий',
		description: 'Расы, организации, статусы и звания',
		type: 'glossary',
		content: `
			<div class="bloc-rule"><div><h3>Расы и народы</h3>
			<ul>
				<li><strong>Эльфы (Elf)</strong> — Древняя раса Aen Seidhe, обладающая долголетием и природной склонностью к магии. Многие эльфы стали скоя’таэлями. (Францеска, Иорвет, Аэлирэнн)</li>
				<li><strong>Краснолюды и гномы (Dwarf)</strong> — Коренастый, но сильный народ Махакама. Искусные кузнецы и воины. (Золтан Хивай, Брувер Гоог, Мунро Бруйс)</li>
				<li><strong>Полукровки и проклятые (Curse)</strong> — Существа или люди, изменённые проклятиями: оборотни, стрыги и другие. (Адда, Моркварг, Ольгерд фон Эверек)</li>
				<li><strong>Дриады (Driada)</strong> — Женщины-воительницы, защитницы Брокилонского леса. Рождаются в результате контактов с другими расами или преобразуются Водой Брокилона. (Эитнэ, Дриада)</li>
			</ul>
			
			<h3>Организации и культы</h3>
			<ul>
				<li><strong>Дикая Охота (Wild Hunt)</strong> — Призрачные эльфы из мира Aen Elle, путешествующие между мирами в поисках средства, что спасло бы их родные земли от Белого Хлада. (Эредин, Имлерих, Карантир)</li>
				<li><strong>Скоя'таэли (Scoiatael)</strong> — Эльфы-партизаны, ведущие войну против людей. Носят на поясах и шапках беличьи хвосты, отсюда прозвище «Белки». (Филавандрель, Эльдайн)</li>
				<li><strong>Ложа Чародеек</strong> — Организация могущественных чародеек, основанная Филиппой Эйльхарт. Ставила целью контроль над политикой Северных королевств.</li>
				<li><strong>Капитул Чародеев</strong> — Орган управления магическим сообществом Севера. Вильгефорц из Роггевеена был одним из его лидеров до Танеддского бунта.</li>
				<li><strong>Круг Гединейт</strong> — Союз друидов со Скеллиге, возглавляемый иерофантом Мышовуром. Занимается сохранением древних знаний и ритуалов.</li>
				<li><strong>Орден Пылающей Розы</strong> — Военно-религиозный орден из Новиграда, возглавляемый Великим Магистром Яковом из Альдерсберга. Стремится очистить мир от магии и инакомыслия.</li>
				<li><strong>Синдикат Новиграда</strong> — Криминальное объединение четырёх боссов: Тесак (Златорубы), Король Нищих (Невидимые), Сиги Ройвен и Ублюдок Младший (Сердцееды).</li>
				<li><strong>Культ Вечного Огня</strong> — Доминирующая религия в Новиграде и Редании. Символизирует очищение, надежду и свет во тьме.</li>
				<li><strong>Культ пророка Лебеды</strong> — Широко распространённое в Северных Королевствах религиозное учение, основанное на изречениях легендарного пророка Лебеды.</li>
			</ul>
			
			<h3>Статусы и звания</h3>
			<ul>
				<li><strong>Лидер (Leader)</strong> — Правители королевств, императоры, конунги или главы преступных синдикатов. Самые сильные карты фракции. (Фольтест, Эмгыр, Бран, Тесак, Францеска)</li>
				<li><strong>Герой (Hero)</strong> — Легендарные личности, чья сила и репутация не позволяют воздействовать на них обычными картами. Не подвержены ослаблению, усилению, уничтожению, а также действию погодных карт и «Казни». (Геральт, Цири, Йеннифэр)</li>
				<li><strong>Правитель (King)</strong> — Монархи Северных королевств, императоры Нильфгаарда и конунги Скеллиге. (Радовид, Эйст Тиршах, Хенсельт, Узурпатор)</li>
				<li><strong>Знать (Kingser)</strong> — Приближённые ко двору особы: придворные, рыцари, барды и родственники правителей. (Лютик, Присцилла, Кагыр, Керис)</li>
				<li><strong>Чародей (Mage)</strong> — Пользователи магии Хаоса. Часто служат советниками королей. Могущественны, но иногда коварны. (Йеннифэр, Вильгефорц, Филиппа, Коралл)</li>
				<li><strong>Ведьмак (Witcher)</strong> — Мутанты, созданные с помощью мутагенов и Испытания Травами. Обладают обострёнными чувствами и замедленным старением. (Геральт, Весемир, Лето, Гезрас)</li>
				<li><strong>Воин (Warrior)</strong> — Солдаты, рыцари, пехотинцы, лучники и прочие профессиональные бойцы. (Вернон Роше, Реданский лучник, Темерийский пехотинец)</li>
				<li><strong>Наёмник (Mercenary)</strong> — Солдаты удачи, охотники за головами, живущие войной и контрактами. (Лео Бонарт, Ярпен Зигрин, Лето из Гулеты)</li>
				<li><strong>Пират (Pirat)</strong> — Морские разбойники со Скеллиге и других морей. (Моркварг, Гудрун Бьорнсдоттир, Капитан Яго)</li>
				<li><strong>Преступник (Criminal)</strong> — Члены криминальных группировок: «Саламандры», «Сердцееды», «Златорубы», «Тени прилива». (Азар Явед, Король Нищих, Ублюдок Младший)</li>
			</ul></div></div>
		`
	},
    bestiary: {
        title: 'Бестиарий',
        description: 'Существа и чудовища',
        type: 'glossary',
        content: `
        <div class="bloc-rule"><div><h3>Существа и чудовища</h3>
        <ul>
            <li><strong>Чудовище (Monster)</strong> — Обобщающий термин для опасных существ, на которых охотятся ведьмаки. Могут быть как реальными животными, так и порождениями магии или проклятий. (Кракен, Орденская гончая, Ингвар)</li>
            <li><strong>Вампир (Blood)</strong> — Существа, питающиеся кровью живых. Делятся на высших (Ориана) и низших (Альпы). Высшие вампиры практически бессмертны и обладают разумом, низшие действуют инстинктивно.</li>
            <li><strong>Драконид (Dragon)</strong> — Крылатые существа, часто дышащие огнём или обладающие ядовитым жалом. Включает драконов, фениксов, куролисков, мантикор. (Феникс, Куролиск, Мантикора, Саския/Саэсентессис)</li>
            <li><strong>Реликт (Relict)</strong> — Древние существа, оставшиеся от прошлых эпох. Часто почитаются людьми как божества или демоны. (Морвудд-бес, Дух Леса, Квариксис-единорог)</li>
            <li><strong>Огройд (Ogr)</strong> — Крупные, сильные, но не очень умные гуманоидные существа. Включает троллей, циклопов и горных великанов. (Старый Грот-циклоп, Пещерный тролль)</li>
            <li><strong>Дух / Призрак (Specter / Ghost)</strong> — Беспокойные мёртвые, не упокоившиеся из-за проклятий, невыполненных обещаний или насильственной смерти. Могут быть как враждебными, так и нейтральными. (Хим, Полуденница, Моровая дева)</li>
            <li><strong>Трупоед (Scavenger)</strong> — Падальщики, питающиеся разлагающимися останками. Часто обитают на кладбищах, полях сражений и в подземельях. (Гуль, Туманник)</li>
            <li><strong>Проклятие (Curse)</strong> — Существа или люди, изменённые проклятиями. Могут быть как изначально людьми, превращёнными в чудовищ, так и отдельной расой проклятых созданий. (Волколак, Адда-Стрыга, Моркварг)</li>
            <li><strong>Древень (Oak)</strong> — Оживлённые деревья, созданные друидами с помощью магии. Подчиняются командам создателя, понимают речь и способны выполнять сложные приказы. (Великий дуб)</li>
            <li><strong>Мантикора (Mantikora)</strong> — Зверь с телом льва, крыльями летучей мыши и хвостом скорпиона. Некоторые особи имеют длинные козлиные рога — Императорские мантикоры. Жало на хвосте отравлено.</li>
            <li><strong>Животное (Animal)</strong> — Обычные звери, не обладающие магическими способностями. Лошади, крысы, собаки. Иногда играют важную роль в способностях других карт. (Плотва, Крыса)</li>
        </ul></div>
    `
    }
};

const ABILITY_ICONS = {
    // Погода
    biting_frost:      'deck/biting_frost.webp',
    frost:             'deck/frost.webp',
    impenetrable_fog:  'deck/impenetrable_fog.webp',
    torrential_rain:   'deck/torrential_rain.webp',
    storm:             'deck/storm.webp',
    clear_weather:     'deck/clear_weather.webp',

    // Отряды
    destroy:                  'deck/destroy.webp',
    spy:                      'deck/spy.webp',
    medic:                    'deck/medic.webp',
    decoy:                    'deck/decoy.webp',
    flock:                    'deck/flock.webp',
    call_rat:                 'deck/call.webp',
    double_row_strength_unit: 'deck/double_row_strength_unit.webp',
    boost_tag_witcher_2:      'deck/witcher.webp',

    // Специальные
    destroy_artf:   'deck/destroy_artifact.webp',
    damage_1:       'deck/damage_1.webp',
    damage_row_1:   'deck/damage_row_1.webp',

    // Артефакты
    boost_1:        'deck/boost_1.webp',
    boost_near_1:   'deck/boost_near_1.webp',

    // Тактики
    boost_row_1:         'deck/boost_row_1.webp',
    double_row_strength: 'deck/double_row_strength_unit.webp',
    boost_tag_witcher_3: 'deck/witcher.webp',
};

const ABILITY_GROUPS = {
    weather: {
        label: 'Погода',
        cards: [
            { id: 'biting_frost' },
            { id: 'frost' },
            { id: 'impenetrable_fog' },
            { id: 'torrential_rain' },
            { id: 'storm' },
            { id: 'clear_weather' }
        ]
    },
    units: {
        label: 'Отряды',
        cards: [
            { id: 'destroy', title: 'Казнь', showBoth: true },
            { id: 'spy' },
            { id: 'medic' },
            { id: 'decoy' },
            { id: 'flock' },
            {
                id: 'call_rat',
                title: 'Призыв',
                ids: ['call_rat', 'call_driad', 'call_warrior'],
                description: 'Призывает на поле несколько определённых карт.'
            },
            { id: 'double_row_strength_unit' },
            {
                id: 'boost_tag_witcher_2',
                title: 'Усиление тега',
                ids: ['boost_tag_witcher_2', 'boost_tag_thirst', 'boost_tag_dwarf'],
                description: 'Усиливает все отряды с указанным тегом в одном ряду на указанное значение силы.'
            },
        ]
    },
    specials: {
        label: 'Специальные',
        cards: [
            { id: 'destroy_artf' },
            { id: 'damage_1', title: 'Атака', ids: ['damage_1','damage_2','damage_3','damage_4','damage_5'] },
            { id: 'damage_row_1', title: 'Атака по ряду', ids: ['damage_row_1','damage_row_2','damage_row_3','damage_row_4','damage_row_5'] }
        ]
    },
    artifacts: {
        label: 'Артефакты',
        cards: [
            { id: 'boost_1', title: 'Усиление', ids: ['boost_1','boost_2','boost_3','boost_4','boost_5'] },
            { id: 'boost_near_1', title: 'Усиление союза', ids: ['boost_near_1','boost_near_2','boost_near_3','boost_near_4','boost_near_5'] }
        ]
    },
    tactics: {
        label: 'Тактики',
        cards: [
            { id: 'boost_row_1', title: 'Усиление ряда', ids: ['boost_row_1','boost_row_2','boost_row_3','boost_row_4','boost_row_5'] },
            { id: 'double_row_strength' },
            {
                id: 'boost_tag_witcher_3',
                title: 'Усиление тега',
                ids: ['boost_tag_witcher_3', 'boost_tag_criminal'],
                description: 'Усиливает все отряды с указанным тегом в выбранном ряду на указанное значение силы.'
            },
        ]
    }
};

const rulesModule = {
    escapeHandler: null,
    currentSection: null,

    initRulesPage() {
        this.createRulesPageHTML();
        this.setupRulesEventListeners();
        this.showRulesPage();
    },

    getAbilityTypeLabel(type) {
        const labels = {
            weather: 'Погода',
            special: 'Специальнst',
            artifact: 'Артефакт',
            tactic: 'Тактика',
            passive: 'Пассивная',
            leader: 'Лидер',
            combat: 'Боевая'
        };
        return labels[type] || 'Прочее';
    },

    buildAbilitiesCatalog() {
        const abilities = window.skillSystem?.abilities;
        if (!abilities) {
            return `<div class="no-content-selected">Способности ещё не загружены</div>`;
        }

        // Значения для групповых способностей: собираем диапазон из ids
        const getRangeValue = (ids, field = 'effect.value') => {
            const values = ids
                .map(id => abilities[id])
                .filter(Boolean)
                .map(a => field.split('.').reduce((o, k) => o?.[k], a))
                .filter(v => typeof v === 'number');
            if (!values.length) return null;
            const min = Math.min(...values);
            const max = Math.max(...values);
            return min === max ? `${min}` : `${min}–${max}`;
        };

        const renderCard = (card) => {
            const ids = card.ids || [card.id];
            const primary = abilities[card.id] || abilities[ids[0]];
            if (!primary) return '';

            const name = card.title || primary.name || card.id;

            let description = '';

            if (card.description) {
                // Явное описание из группы — приоритетнее
                description = card.description;
            } else if (card.showBoth && primary.unitDescription) {
                description = `${primary.description || ''}
                    <div style="margin-top:6px; opacity:0.85;"><em>На отряде:</em> ${primary.unitDescription}</div>`;
            } else if (card.mode === 'unit' && primary.unitDescription) {
                description = primary.unitDescription;
            } else {
                description = primary.description || '';
            }

            // Диапазон значений для объединённых карточек
            if (ids.length > 1 && !card.description) {
                const range = getRangeValue(ids);
                if (range) {
                    description += `<div style="margin-top:4px; opacity:0.85;"><em>Значение:</em> ${range}</div>`;
                }
            }

            const iconPath = ABILITY_ICONS[card.id] || `deck/${card.id}.webp`;

            return `
                <div class="bloc-rule">
                    <img src="${iconPath}" alt="${name}" class="rule-modal__image"
                         onerror="this.style.display='none'">
                    <div>
                        <h3>${name}</h3>
                        <p>${description}</p>
                    </div>
                </div>
            `;
        };

        const order = ['weather', 'units', 'specials', 'artifacts', 'tactics'];

        return order.map(groupKey => {
            const group = ABILITY_GROUPS[groupKey];
            if (!group) return '';

            const items = group.cards.map(renderCard).join('');
            if (!items) return '';

            return `<h3>${group.label}</h3>${items}`;
        })
        .filter(Boolean)
        .join('<div class="section-divider"></div>');
    },
	
    resetRulesState() {
        document.querySelectorAll('.rule-item.active, .content-section.active').forEach(el => el.classList.remove('active'));
        const noContent = document.querySelector('.no-content-selected');
        if (noContent) noContent.style.display = 'flex';
        const rulesContent = document.getElementById('rulesContent');
        if (rulesContent) rulesContent.scrollTop = 0;
        this.currentSection = null;
    },

    createRulesPageHTML() {
        document.querySelector('.rules-page')?.remove();
        document.querySelector('.rule-modal-overlay')?.remove();

        const rulesPage = document.createElement('div');
        rulesPage.className = 'rules-page';
        rulesPage.innerHTML = `
            <button class="back-to-menu-btn" id="backToMenuBtn">НАЗАД</button>
            <div class="rules-title">ПРАВИЛА И ИНСТРУКЦИИ</div>
            <div class="rules-container">
                <div class="rules-sidebar">
                    <div class="rules-sections">
                        <h3>ПРАВИЛА</h3>
                        <div class="section-divider"></div>
                        <div class="rules-list" id="rulesList">${this.generateRulesList('rule')}</div>
                    </div>
                    <div class="instructions">
                        <h3>ИНСТРУКЦИИ</h3>
                        <div class="section-divider"></div>
                        <div class="rules-list" id="instructionsList">${this.generateRulesList('instruction')}</div>
                    </div>
                    <div class="rules-sections">
                        <h3>ГЛОСАРИЙ</h3>
                        <div class="section-divider"></div>
                        <div class="rules-list" id="glossary">${this.generateRulesList('glossary')}</div>
                    </div>
                </div>
                <div class="rules-content" id="rulesContent">
                    <div class="no-content-selected">
                        <div>Выберите раздел для просмотра информации</div>
                        <div style="font-size: 14px; margin-top: 10px;">Нажмите на любой пункт в левой части</div>
                    </div>
                    ${this.generateContentSections()}
                </div>
            </div>
        `;
        document.body.appendChild(rulesPage);
        this.createRuleModal();
    },

    generateRulesList(type) {
        return Object.values(rulesData)
            .filter(rule => rule.type === type)
            .map(rule => `<div class="rule-item" data-rule="${rule.title}"><div class="rule-item__title">${rule.title}</div><div class="rule-item__description">${rule.description}</div></div>`)
            .join('');
    },

    generateContentSections() {
        return Object.values(rulesData)
            .map(rule => `<div class="content-section" id="content-${rule.title}"><div class="rule-modal__title">${rule.title}</div><div class="rule-modal__content">${rule.content}</div></div>`)
            .join('');
    },

    createRuleModal() {
        const ruleModal = document.createElement('div');
        ruleModal.className = 'rule-modal-overlay';
        ruleModal.innerHTML = `<div class="rule-modal" id="ruleModal"><div class="rule-modal__title" id="ruleModalTitle"></div><div class="rule-modal__content" id="ruleModalContent"></div></div>`;
        document.body.appendChild(ruleModal);
    },

    setupRulesEventListeners() {
        document.getElementById('backToMenuBtn')?.addEventListener('click', () => this.hideRulesPage());
        
        document.querySelectorAll('.rule-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.showContent(e.currentTarget.dataset.rule);
                audioManager?.playSound('button');
            });
        });

        document.querySelector('.rule-modal-overlay')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('rule-modal-overlay')) this.hideRuleModal();
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('#backToMenuBtn, .rule-item')) {
                audioManager?.playSound('touch');
            }
        });

        this.setupEscapeHandler();
    },

    setupEscapeHandler() {
        if (this.escapeHandler) document.removeEventListener('keydown', this.escapeHandler);
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') this.isRuleModalOpen() ? this.hideRuleModal() : this.hideRulesPage();
        };
        document.addEventListener('keydown', this.escapeHandler);
    },

    showContent(ruleTitle) {
        document.querySelectorAll('.rule-item').forEach(item => item.classList.toggle('active', item.dataset.rule === ruleTitle));
        document.querySelectorAll('.content-section').forEach(section => section.classList.toggle('active', section.id === `content-${ruleTitle}`));

        const noContent = document.querySelector('.no-content-selected');
        if (noContent) noContent.style.display = 'none';

        // Заполняем каталог способностей при первом открытии раздела
        if (ruleTitle === 'Способности карт') {
            const catalog = document.getElementById('abilitiesCatalog');
            if (catalog && !catalog.dataset.filled) {
                catalog.innerHTML = this.buildAbilitiesCatalog();
                catalog.dataset.filled = 'true';
            }
        }

        this.currentSection = ruleTitle;
        document.getElementById('rulesContent')?.scrollTo({ top: 0, behavior: 'smooth' });
    },

    isRuleModalOpen() {
        return document.querySelector('.rule-modal-overlay')?.classList.contains('active') ?? false;
    },

    hideRuleModal() {
        document.querySelector('.rule-modal-overlay')?.classList.remove('active');
        audioManager?.playSound('button');
    },

    showRulesPage() {
        const logo = document.querySelector('.logo');
        const menuButtons = document.querySelector('.main-menu-buttons');
        
        if (logo) logo.style.animation = 'fadeOutUp 0.5s ease forwards';
        if (menuButtons) menuButtons.style.animation = 'fadeOutDown 0.5s ease forwards';

        setTimeout(() => {
            const startPage = document.querySelector('.start-page');
            if (startPage) {
                startPage.style.opacity = '0';
                setTimeout(() => startPage.style.display = 'none', 300);
            }

            const rulesPage = document.querySelector('.rules-page');
            if (rulesPage) {
                rulesPage.style.display = 'flex';
                requestAnimationFrame(() => {
                    rulesPage.classList.add('active');
                    rulesPage.style.opacity = '1';
                });
            }
            this.setupEscapeHandler();
        }, 500);
    },

    hideRulesPage() {
        const rulesPage = document.querySelector('.rules-page');
        if (!rulesPage) return;

        const title = rulesPage.querySelector('.rules-title');
        const container = rulesPage.querySelector('.rules-container');
        
        if (title) title.style.animation = 'fadeOutUp 0.5s ease forwards';
        if (container) container.style.animation = 'fadeOutDown 0.5s ease forwards';

        setTimeout(() => {
            rulesPage.style.opacity = '0';
            setTimeout(() => {
                rulesPage.remove();
                document.querySelector('.rule-modal-overlay')?.remove();
                this.restoreMainMenu();
                if (this.escapeHandler) {
                    document.removeEventListener('keydown', this.escapeHandler);
                    this.escapeHandler = null;
                }
                this.currentSection = null;
            }, 300);
        }, 300);

        audioManager?.playSound('button');
    },

    restoreMainMenu() {
        const startPage = document.querySelector('.start-page');
        if (!startPage) return;

        startPage.style.display = 'flex';
        requestAnimationFrame(() => {
            startPage.style.opacity = '1';
            const logo = startPage.querySelector('.logo');
            const menuButtons = startPage.querySelector('.main-menu-buttons');
            
            if (logo) {
                logo.style.animation = 'none';
                logo.offsetWidth;
                logo.style.animation = 'fadeInDown 0.5s ease forwards';
            }
            if (menuButtons) {
                menuButtons.style.animation = 'none';
                menuButtons.offsetWidth;
                menuButtons.style.animation = 'fadeInUp 0.5s ease forwards';
            }
        });
    }
};

window.rulesModule = rulesModule;