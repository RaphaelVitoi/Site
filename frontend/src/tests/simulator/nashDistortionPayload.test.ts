import { decodeNashDistortionPayload } from '@/components/simulator/workers/nashDistortionPayload';

describe('Nash distortion worker payload contract', () => {
	it('decodes the legitimate fractional RP payload without changing aggression', () => {
		expect(decodeNashDistortionPayload(new Float64Array([0.35, 0.65, 1.25]))).toEqual({
			ipRp: 35,
			oopRp: 65,
			aggression: 1.25,
		});
	});

	it('rejects a truncated payload before arithmetic', () => {
		expect(decodeNashDistortionPayload(new Float64Array([0.35, 0.65]))).toBeNull();
	});
});
