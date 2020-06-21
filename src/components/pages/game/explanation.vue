<template>
<div class="content-small">
	<div id="gamePage_header">
		<h1
			v-if="myRole == 'observere'"
			class="game-title"
			id="gamePage_waitTitle">
			Идёт объяснение
		</h1>
		<h1
			v-if="myRole == 'speaker'"
			class="game-title"
			id="gamePage_speakerTitle">
			Ты объясняешь
		</h1>
		<h1
			v-if="myRole == 'listener'"
			class="game-title"
			id="gamePage_listenerTitle">
			Ты отгадываешь
		</h1>
	</div>
	<div id="gamePage_body">
		<speaker-listener
			v-if="(myRole == 'observer' || myRole == 'listener') && state != 'delay'">
		</speaker-listener>
		<div
			v-if="myRole == 'observer' || myRole == 'listener'"
			id="gamePage_observerBox">
			<h1
				v-if="state == 'explanation'"
				id="gamePage_observerTimer">
					{{ explanationTime }}
			</h1>
			<h1
				v-else-if="state == 'aftermath'"
				class="timer-aftermath"
				id="gamePage_observerTimer">
					{{ aftermathTime }}
			</h1>
		</div>
		<div
			v-if="state == 'delay'"
			id="gamePage_explanationDelayBox">
			<h1
				id="gamePage_explanationDelayTimer"
				:style="{background: delayTimerBackground}">
				{{ delayTime }}
			</h1>
		</div>
		<div
			v-if="(state == 'explanation' || state == 'aftermath') && myRole == 'speaker'"
			id="gamePage_explanationBox">
			<div id="gamePage_explanationWordTimer">
				<h1 id="gamePage_explanationWordParent">
					<span id="gamePage_explanationWord"> {{ word }} </span>
				</h1>
				<h1
					v-if="state == 'explanation'"
					id="gamePage_explanationTimer">
					{{ explanationTime }}
				</h1>
				<h1
					v-else-if="state == 'aftermath'"
					class="timer-aftermath"
					id="gamePage_explanationTimer">
					{{ aftermathTime }}
				</h1>
			</div>
			<div id="gamePage_explanationActions">
				<button
					@click="notExplainedAction"
					class="medium-button bg-blue"
					id="gamePage_explanationFailed">
					Не угадал
				</button><!--
			 --><button
					@click="mistakeAction"
					class="medium-button bg-red"
					id="gamePage_explanationMistake">
					Ошибка
				</button>
				<button
					@click="explainedAction"
					class="medium-button bg-green"
					id="gamePage_explanationSuccess">
					Угадал
				</button>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import app from "__/app.js"
import { animate, colorGradientRGB, stairs, timeSync, minSec, secMsec, sound } from "__/lib"

import speakerListener from "./boxes/speakerListener.vue"

export default {
	data: function() {
		return {
			state: null,
			delayTimerBackground: null,
			delayTime: null,
			explanationTimeSec: null,
			aftermathTimeMsec: null
		}
	},
	computed: {
		...mapGetters(["myRole"]),
		...mapState({
			speaker: state => state.room.speaker,
			listener: state => state.room.listener,
			word: state => state.room.word,
			startTime: state => state.room.startTime,
			settings: state => state.room.settings
		}),
		explanationTime: function() {
			return minSec(this.explanationTimeSec);
		},
		aftermathTime: function() {
			if (this.aftermathTimeMsec != 0) return secMsec(this.aftermathTimeMsec)
			return "время истекло"
		}
	},
	watch: {
		word: {
			handler: function(value, newValue) {
				if (value) {
					this.sizeWord(value);
				}
			}
		}
	},
	methods: {
		explainedAction() {
			app.explained();
		},
		notExplainedAction() {
			app.notExplained();
		},
		mistakeAction() {
			app.mistake();
		},
		sizeWord(text) {
			if (!text) return
			let eWord = document.querySelector("#gamePage_explanationWord");
			let eWordParent = document.querySelector("#gamePage_explanationBox");
			let baseSize = 15;
			eWord.innerText = text;
			eWord.style["font-size"] = `${baseSize}px`;
			let wordWidth = eWord.getBoundingClientRect().width;
			let parentWidth = eWordParent.getBoundingClientRect().width;
			eWord.style["font-size"] = `${Math.min(50,
				baseSize * parentWidth / wordWidth)}px`;
		},
    	animateDelayTimer: async function(startTime, roundId) {
			let gradient = colorGradientRGB(
				[[76, 175, 80], [76, 175, 80],
				[255, 193, 7], [255, 193, 7],
				[255, 0, 0], [255, 0, 0]]);
			await animate({
				startTime,
				duration: this.settings.delayTime,
				draw: (progress) => {
					this.delayTime = stairs(1 - progress, this.settings.delayTime / 1000) + 1;
					this.delayTimerBackground = `rgb(${gradient(progress).join()})`;
				},
				stopCondition: () => {
					return roundId != this.$store.state.room.roundId;
				}
			})
		},
		animateExplanationTimer: async function(startTime, roundId) {
			let animation = animate({
				startTime,
				duration: this.settings.explanationTime,
				draw: (progress) => {
					this.explanationTimeSec =
						stairs(1 - progress, this.settings.explanationTime / 1000) + 1;
				},
				stopCondition: () => {
					return roundId != this.$store.state.room.roundId;
				}
			})
			await animation;
			this.explanationTimeSec = 0;
		},
		animateAftermathTimer: async function(startTime, roundId) {
			let animation =  animate({
				startTime,
				duration: this.settings.aftermathTime,
				draw: (progress) => {
					this.aftermathTimeMsec =
						stairs(1 - progress, this.settings.aftermathTime / 100) + 1;
				},
				stopCondition: () => {
					return roundId != this.$store.state.room.roundId;
				}
			})
			await animation;
			this.aftermathTimeMsec = 0;
		}
	},
	mounted: function() {
		let roundId = this.$store.state.room.roundId;
		let delayStartTime = this.startTime - this.settings.delayTime;
		let explanationStartTime = this.startTime;
		let aftermathStartTime = this.startTime + this.settings.explanationTime;
		let aftermathEndTime = aftermathStartTime + this.settings.aftermathTime;
        setTimeout(async () => {
			this.state = "delay";
            await this.animateDelayTimer(delayStartTime, roundId);
			this.state = "explanation";
			this.$nextTick(() => this.sizeWord(this.word));
			await this.animateExplanationTimer(explanationStartTime, roundId);
			this.state = "aftermath";
            await this.animateAftermathTimer(aftermathStartTime, roundId);
		}, delayStartTime - timeSync.getTime());
        let stopCondition = () => roundId != this.$store.state.room.roundId
        sound.playSound("start", explanationStartTime, stopCondition);
        sound.playSound("final", aftermathStartTime, stopCondition);
        sound.playSound("final+", aftermathEndTime, stopCondition);
        for (let i = 1; i <= Math.floor(this.settings.delayTime / 1000); i++) {
            sound.playSound("countdown", explanationStartTime - 1000 * i, stopCondition);
        }
	},
	components: {speakerListener}
}
</script>
