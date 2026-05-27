# Persona 3 Reload: Pause Menu UI & Personal Portfolio

A web-based replica of the pause menu from *Persona 3 Reload*, built entirely with plain HTML, CSS, and JavaScript. 

I built this project because I wanted a unique interactive portfolio to display my work and, simply put, because why not. My primary goal was to make the layout and functionality as faithful to the original game's interface as I possibly could within the constraints of a web browser. 

### Note on Mobile Support
I should mention that this website does not work on mobile devices and will never do so. It is nearly impossible to achieve a similar looking effect on a mobile aspect ratio while maintaining the specific layout and scale of the original menu. This project is built specifically as a novelty desktop experience and a technical exercise, rather than a standard responsive personal website.

### Technical Implementation
To replicate the specific geometric shapes and layout of the game without relying on external libraries, frameworks, or engines, the project utilizes several core web technologies:
*   **CSS Layouts:** Extensive use of CSS Grid and Flexbox to manage the placement of UI elements on the screen.
*   **Transformations:** Usage of CSS properties such as `transform: skew()`, `rotate()`, and `clip-path` to construct the angled menus, text boxes, and background elements.
*   **Vanilla JavaScript:** Lightweight DOM manipulation is used to handle tab switching, keyboard/mouse interactions, and updating the current active state of the menu panels.

If you have any recommendations, code optimizations, or ideas, feel free to contact me or open an issue on the repository.

---

## How to Use

You do not need any special server environments, package managers, or build tools to run this code locally. 

1.  **Clone the repository:**
```bash
    git clone [https://github.com/notwewnothing/persona.git](https://github.com/notwewnothing/persona.git)
    ```

2.  **Navigate to the directory:**
```bash
    cd persona
    ```

3.  **Run the project:**
    Simply open the `index.html` file in your preferred web browser to view the interface.

---

## Project Structure

```text
├── index.html       # Main structure & portfolio content
├── css/
│   └── style.css    # Layout, angled designs, and animations
└── js/
    └── main.js      # Menu logic, tab switching, and interaction handling
