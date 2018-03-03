import { Injectable } from '@angular/core';
import { Challenge } from './challenge.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { RpService } from './rp.service';
import { ActivatedRoute } from '@angular/router';

const GLOBAL = 'GLOBAL';
const ROOM = 'ROOM';

@Injectable()
export class OptionsService {

	constructor(private route: ActivatedRoute) {}

	private rpCode: string = this.route.snapshot.paramMap.get('rpCode');

	private subject<T>(propName: string, global: 'GLOBAL'|'ROOM', defaultValue: T): BehaviorSubject<T> {
		let localStorageKey = global === 'GLOBAL' ?
			`rpnow.global.${propName}` :
			`rpnow.rp.${this.rpCode}.${propName}`
		
		console.log(localStorageKey);
		let stringValue = localStorage.getItem(localStorageKey);
		let value = (stringValue != null) ? JSON.parse(stringValue) : defaultValue;

		let subj = new BehaviorSubject(value);

		subj.subscribe(value => localStorage.setItem(localStorageKey, JSON.stringify(value)));

		return subj;
	}

	public readonly lastColor$: BehaviorSubject<string> = this.subject('lastColor', GLOBAL, '#80c9ff');
	public get lastColor() { return this.lastColor$.value; }
	public set lastColor(value) { this.lastColor$.next(value); }

	public readonly challenge$: BehaviorSubject<Readonly<Challenge>> = this.subject('challenge', GLOBAL, null);
	public get challenge() { return this.challenge$.value; }
	public set challenge(value) { this.challenge$.next(value); }

	public readonly downloadOOC$: BehaviorSubject<boolean> = this.subject('downloadOOC', GLOBAL, true);
	public get downloadOOC() { return this.downloadOOC$.value; }
	public set downloadOOC(value) { this.downloadOOC$.next(value); }

	public readonly nightMode$: BehaviorSubject<boolean> = this.subject('nightMode', GLOBAL, false);
	public get nightMode() { return this.nightMode$.value; }
	public set nightMode(value) { this.nightMode$.next(value); }

	public readonly notificationNoise$: BehaviorSubject<number> = this.subject('notificationNoise', GLOBAL, 1);
	public get notificationNoise() { return this.notificationNoise$.value; }
	public set notificationNoise(value) { this.notificationNoise$.next(value); }

	public readonly pressEnterToSend$: BehaviorSubject<boolean> = this.subject('pressEnterToSend', GLOBAL, true);
	public get pressEnterToSend() { return this.pressEnterToSend$.value; }
	public set pressEnterToSend(value) { this.pressEnterToSend$.next(value); }

	public readonly showMessageDetails$: BehaviorSubject<boolean> = this.subject('showMessageDetails', GLOBAL, true);
	public get showMessageDetails() { return this.showMessageDetails$.value; }
	public set showMessageDetails(value) { this.showMessageDetails$.next(value); }

	public readonly msgBoxContent$: BehaviorSubject<string> = this.subject('msgBoxContent', ROOM, '');
	public get msgBoxContent() { return this.msgBoxContent$.value; }
	public set msgBoxContent(value) { this.msgBoxContent$.next(value); }

	public readonly msgBoxVoice$: BehaviorSubject<'narrator'|'ooc'|number> = this.subject('msgBoxVoice', ROOM, 'narrator') as BehaviorSubject<'narrator'|'ooc'|number>;
	public get msgBoxVoice() { return this.msgBoxVoice$.value; }
	public set msgBoxVoice(value) { this.msgBoxVoice$.next(value); }

	public readonly recentCharas$: BehaviorSubject<number[]> = this.subject('recentCharas', ROOM, []);
	public get recentCharas() { return this.recentCharas$.value; }
	public set recentCharas(value) { this.recentCharas$.next(value); }

}
