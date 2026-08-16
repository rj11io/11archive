# Testing things: materials, products, and plants

This is the oldest engineering tradition, and the one with the most developed vocabulary
for the problems software argues about informally. Sampling, acceptance criteria, and the
cost of a false alarm are all written down here, in standards, before inspection starts.

## The first split: does the test destroy the thing

**Destructive testing** breaks the sample to learn its limits. You cannot then sell it, so
you test a sample and infer about the batch.

| Test | What it does | What it tells you |
|---|---|---|
| Tensile test | pulls a specimen until it breaks | strength, stiffness, how much it stretches first |
| Hardness test | presses a defined indenter with a defined force | resistance to denting and wear |
| Impact test, for example Charpy | strikes a notched specimen with a pendulum | how much energy it absorbs before fracturing, and whether it fails brittle or ductile |
| Fatigue test | cycles a load millions of times | how many cycles it survives at a given stress |
| Creep test | holds a load at temperature for a long time | slow deformation under sustained load |
| Burst test | pressurises until the vessel fails | the actual failure pressure and mode |

**Non-destructive testing (NDT)** inspects without harming the item, so you can test the
actual part that goes into service. Six methods dominate:

| Method | How it works | Finds |
|---|---|---|
| Visual (VT) | trained inspection, often with optics or a borescope | surface defects |
| Liquid penetrant (PT) | a dye is drawn into surface cracks by capillary action, then developed | surface-breaking cracks in non-porous materials |
| Magnetic particle (MT) | magnetise the part, iron particles gather at flux leakage | surface and near-surface cracks in ferrous metals |
| Eddy current (ET) | an alternating field induces currents; flaws distort them | surface cracks, corrosion, conductivity changes |
| Ultrasonic (UT) | high-frequency sound reflects off internal discontinuities | internal flaws, and wall thickness |
| Radiographic (RT) | X-rays or gamma rays image the interior | internal voids, inclusions, weld defects |

The critical distinction is **surface versus volumetric**. Visual, penetrant, and magnetic
particle see the surface only. Ultrasonic and radiographic see inside. Choosing a surface
method and then reporting "no defects found" is a coverage claim failure of the exact kind
described in [01](01-anatomy-of-a-test.md).

NDT inspectors are themselves certified to levels under schemes such as ASNT SNT-TC-1A or
NAS 410: Level I performs under supervision, Level II performs and interprets
independently, Level III writes the procedures and trains. **The person is part of the
instrument, so the person is qualified and re-qualified.** Software has no equivalent, and
the absence shows up whenever a security assessment's quality depends entirely on which
individual did it.

## Sampling: the part software should steal

You cannot test every item. Acceptance sampling is the mathematics of deciding how many to
test and what result justifies accepting the lot.

Under **ISO 2859-1**, and its American equivalent ANSI/ASQ Z1.4, a sampling plan states,
on one page and before inspection begins:

- the lot size
- the inspection level, which sets how much scrutiny the lot gets
- the sample size drawn from it
- the **acceptance quality limit (AQL)**: the defect rate that will routinely be accepted
- the accept number and the reject number: find this many defects, accept; find this many,
  reject the whole lot
- switching rules that tighten inspection after failures and loosen it after a run of
  clean lots

Both error directions have names and owners:

- **Producer's risk**: a good lot is rejected. The manufacturer bears this.
- **Consumer's risk**: a bad lot is accepted. The buyer bears this.

Two things are remarkable about this from a software perspective. First, everyone agrees
the escape rate will not be zero, and they write down the number. Second, inspection
intensity adapts automatically to demonstrated quality, so a supplier with a clean record
gets inspected less.

The military ancestor, MIL-STD-105E, was cancelled, with the 2008 cancellation notice
pointing users to MIL-STD-1916 or ANSI/ASQ Z1.4. ISO 2859-1 is close to, but not identical
with, Z1.4; a 1999 revision changed some accept/reject pairs.

Compare this to how software decides what to test. Almost no team states an accepted
escape rate, an inspection intensity, or a switching rule. Almost every team has all three
implicitly. Writing them down is the single most transferable idea in this report, and
[13](13-cross-domain-map.md) sketches what it would look like.

**Statistical process control (SPC)** is the continuous cousin. Rather than inspecting
lots, you plot a process measurement over time on a control chart with limits derived from
the process's own variation, and act when the pattern says something changed. The
distinction it enforces is between normal variation, which you must not react to, and a
real shift, which you must. Software teams staring at latency graphs reinvent this badly
and constantly.

## Reliability testing: making time go faster

The problem: you need to know whether a product survives ten years, and you have four
months.

| Method | What it does | Purpose |
|---|---|---|
| Accelerated life testing (ALT) | run at higher stress, use a physical model to extrapolate | quantitative: estimate life at normal stress |
| Highly accelerated life testing (HALT) | escalate temperature and vibration until it breaks, then further | qualitative: find the weak links in the design. There are no survivors, on purpose |
| Highly accelerated stress screening (HASS) | apply stresses derived from HALT to production units | catch manufacturing defects, not design defects |
| Environmental stress screening (ESS) | milder stresses, applied to 100% of units | remove early-life failures before shipping |
| Burn-in | run units under power and temperature for a period | the same goal, thermal and voltage only |

The important pairing is HALT and HASS. HALT is run on the design, to failure, to learn
*how* it fails and where its margins are. HASS is run in production, at stresses chosen
from what HALT revealed, to catch units built wrong. You cannot do HASS without first
doing HALT, because HALT is what tells you which stresses are informative and which are
merely destructive.

The software analogue of HALT is a stress test run past the breaking point to learn the
failure mode, which is different from a load test run to confirm a target. Most teams run
the second and call it the first.

Environmental testing more broadly covers thermal cycling, humidity, salt spray for
corrosion, vibration and shock, altitude, and ingress protection, the IP rating that
states resistance to dust and water.

## Commissioning: testing an installation

Industrial and pharmaceutical projects test equipment at three points, and the sequence is
a direct analogue of the software deployment pipeline.

| Stage | Where | What it proves |
|---|---|---|
| Factory acceptance test (FAT) | at the manufacturer, before shipping | the equipment meets specification under controlled conditions |
| Site acceptance test (SAT) | at the final installation | it still works with real utilities, real interfaces, and site conditions |
| Commissioning and qualification | on site, in final configuration | the integrated system runs as intended |

FAT is a staging environment. SAT is the thing everyone skips and then regrets, because
"it worked at the vendor's site" is the physical version of "it works on my machine".

Pressure and load testing then proves the built system:

- **Hydrostatic testing** fills a pipe or vessel with water, pressurises above the maximum
  allowable working pressure, and holds it while watching for leaks and deformation. Water
  rather than gas, because water barely compresses, so a failure releases far less stored
  energy. That is a test designed around the blast radius of the test itself.
- **Proof pressure testing** applies a multiple of working pressure, commonly 1.5 times,
  to show the item tolerates more than it will ever see without permanent damage.
- **Proof load testing** does the same for cranes, lifting equipment, and structures.

The safety factor is the point. These systems are not tested at their rated capacity, they
are tested well beyond it, and the margin is stated. Very little software carries an
explicit margin of this kind, even though the equivalent, testing at several times peak
expected load, is cheap.

## Vehicles and consumer safety

Crash testing is the most visible public testing programme in the world, and its structure
is instructive.

Euro NCAP's assessment from 2026 uses four pillars, each scored out of 100 and expressed
as a percentage:

1. **Safe Driving**: technologies that help the driver avoid errors, including driver
   monitoring.
2. **Crash Avoidance**: systems that prevent or reduce a collision, tested for frontal,
   lane, and low-speed cases.
3. **Crash Protection**: the traditional crash tests, covering the structure, restraints,
   and protection of occupants, pedestrians and cyclists.
4. **Post-Crash Safety**: rescue information, emergency call systems, and multi-collision
   braking, covering the period after impact.

Two design decisions are worth copying. First, **the overall star rating is limited by the
weakest pillar**, so a manufacturer cannot compensate for poor occupant protection with
excellent driver assistance. Second, the protocol is **published in advance and revised on
a schedule**, which makes it a moving target on purpose: manufacturers optimise for the
test, so the test changes. That is an explicit, institutional answer to Goodhart's law,
discussed in [14](14-how-testing-fails.md).

## Electronics and semiconductors

| Test | What it does |
|---|---|
| Automated optical inspection (AOI) | camera inspection of assembled boards for placement and solder defects |
| In-circuit test (ICT) | probes contact test points to measure individual components on the board |
| Boundary scan (JTAG) | dedicated on-chip circuitry shifts test patterns through pins, testing connections without physical probes |
| Functional test | the board is powered and exercised as it would be in use |
| Automated test equipment (ATE) | tests every die on a wafer, and every packaged part, at speed |
| EMC and EMI testing | verifies the device neither emits nor is disrupted by electromagnetic interference; required for CE and FCC marking |

**Design for test (DFT)** is the practice of adding structures to a chip or board purely so
it can be tested: scan chains, built-in self-test, accessible test points. This is exactly
the same idea as designing software for testability, and the hardware world takes it more
seriously because a chip that cannot be tested cannot be sold.

Boundary scan is worth one more sentence, because it solved a problem software also has.
As boards got denser, physical probes stopped fitting. The response was to build the test
access into the device itself. The software equivalent is instrumentation, structured
logging, and health endpoints: capabilities added to the product solely so the product can
be inspected in places you can no longer reach from outside.

## Food, agriculture, and consumables

**HACCP**, hazard analysis and critical control points, is the framework behind most food
safety regulation. Its structure is a testing system, and it makes a distinction software
tends to blur:

- Identify hazards and the **critical control points** where a hazard can be prevented,
  eliminated, or reduced to an acceptable level. A cooking step that kills pathogens is a
  CCP.
- Set **critical limits** at each point, for example a minimum core temperature.
- **Monitor** each CCP: a planned sequence of observations or measurements that says
  whether the point is under control.
- Define **corrective actions** in advance, so that when monitoring shows loss of control,
  nobody improvises.
- **Verify**: ongoing checks that the plan is being followed and is working.
- **Validate**: separately, obtain scientific evidence that the control measures are
  actually capable of controlling the hazard. Done before implementation and after any
  major change.

The validation and verification pair here is sharper than the software version in
[07](07-safety-critical-and-standards.md). Verification asks whether you followed the
plan. Validation asks whether the plan was ever capable of working. A team with a green
build has verification. Almost nobody has validation.

Two other food and agriculture tests are worth naming as examples of unusual oracles:

- **Sensory analysis** uses trained human panels under standardised conditions. The
  **triangle test**, standardised as ISO 4120, gives an assessor three samples where two
  are identical and one differs, and asks which is the odd one. It is a forced choice, so
  guessing produces a known rate of correct answers, and the statistics account for it.
  This is how you get a numeric, defensible answer out of subjective human perception,
  which is a problem usability testing also has and solves less rigorously.
- **Shelf-life testing**, including accelerated versions at raised temperature, is the food
  equivalent of a soak test.

## Sources

- [ASNT: what is nondestructive testing](https://www.asnt.org/what-is-nondestructive-testing);
  [the six most common NDT methods](https://www.vareximaging.com/blogs/what-are-the-six-most-common-ndt-methods/)
- [ISO 2859-1 inspection levels and AQL](https://qualityinspection.org/inspection-level/);
  [ISO 2859-1 versus ANSI/ASQ Z1.4](https://ecqa.com/iso-2859-1-vs-ansi-z1-4/);
  [brief history of ANSI/ASQ Z1.4](https://www.qualitymag.com/articles/98097-brief-history-of-ansi-asq-z14)
- [Tektronix: Fundamentals of HALT/HASS testing](https://download.tek.com/document/HALT_HASS_WP.pdf);
  [Accendo Reliability on ESS and HASS](https://accendoreliability.com/ess-hass/)
- [FAT and SAT in commissioning](https://blog.pqegroup.com/commissioning-qualification/fat-and-sat);
  [hydrostatic and proof pressure testing](https://sarum-hydraulics.co.uk/white-paper/hydrostatic-pressure-testing/hydrostatic-proof-burst-fatigue-test-explainer/)
- [Euro NCAP, the stars explained](https://www.euroncap.com/how-to-read-the-stars/);
  [2026 protocol changes](https://www.euroncap.com/press-media/euro-ncap-announces-2026-protocol-changes-to-tackle-modern-driving-risks/)
- [FDA HACCP principles and application guidelines](https://www.fda.gov/food/hazard-analysis-critical-control-point-haccp/haccp-principles-application-guidelines);
  [ISO 4120 triangle test](https://www.iso.org/standard/33495.html)
